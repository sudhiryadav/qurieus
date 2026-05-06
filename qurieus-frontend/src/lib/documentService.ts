import { prisma } from "@/utils/prismaDB";
import { logger } from "@/lib/logger";
import s3Service from "@/lib/s3";

// Shared validation constants
export const DOCUMENT_UPLOAD = {
  MAX_FILE_SIZE_MB: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "50"),
  ALLOWED_FILE_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/gif",
  ] as const,
} as const;

export interface DocumentFetchOptions {
  userId: string;
  includeUserInfo?: boolean;
}

export async function fetchUserDocuments(options: DocumentFetchOptions) {
  const { userId, includeUserInfo = false } = options;
  
  // Verify the target user exists if we need user info
  let targetUser = null;
  if (includeUserInfo) {
    targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });

    if (!targetUser) {
      throw new Error("User not found");
    }
  }

  // Fetch documents for the user
  const documents = await prisma.document.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      title: true,
      fileName: true,
      originalName: true,
      fileType: true,
      fileSize: true,
      category: true,
      description: true,
      keywords: true,
      uploadedAt: true,
      createdAt: true,
      updatedAt: true,
      fileUrl: true,
      aiDocumentId: true,
      status: true,
      qdrantDocumentId: true,
      chunkCount: true,
      isProcessed: true,
      processedAt: true,
      metadata: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      uploadedAt: 'desc',
    },
  });

  return {
    documents,
    user: targetUser
  };
}

export interface UploadDocumentParams {
  file: File;
  userId: string;
  title?: string;
  description?: string;
  category?: string;
}

export interface UploadDocumentResult {
  document: Awaited<ReturnType<typeof prisma.document.create>>;
  processingStatus: "PROCESSING" | "PROCESSED";
}

/**
 * Core document upload logic - used by both user and admin routes.
 * Uploads to S3, creates Prisma record, sends to AI backend for processing.
 */
export async function uploadDocument(params: UploadDocumentParams): Promise<UploadDocumentResult> {
  const { file, userId, title, description, category } = params;

  const maxSize = DOCUMENT_UPLOAD.MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size === 0) {
    throw new Error("File is empty");
  }
  if (file.size > maxSize) {
    throw new Error(`File exceeds the ${DOCUMENT_UPLOAD.MAX_FILE_SIZE_MB}MB size limit`);
  }
  if (!DOCUMENT_UPLOAD.ALLOWED_FILE_TYPES.includes(file.type as any)) {
    throw new Error(`File type ${file.type} is not supported`);
  }

  const aiServiceUrl = process.env.BACKEND_URL;
  const aiApiKey = process.env.BACKEND_API_KEY;
  if (!aiServiceUrl || !aiApiKey) {
    throw new Error("AI service not configured");
  }

  let uploadedFileUrl: string | null = null;
  let createdDocument: Awaited<ReturnType<typeof prisma.document.create>> | null = null;

  try {
    const fileName = s3Service.generateFileName(file.name, userId);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    uploadedFileUrl = await s3Service.uploadDocument(buffer, fileName, file.type);

    const documentId = crypto.randomUUID();
    createdDocument = await prisma.document.create({
      data: {
        id: documentId,
        title: title || file.name,
        description: description || "",
        fileName,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category: category || "General",
        fileUrl: uploadedFileUrl,
        userId,
        status: "PROCESSING",
      },
    });

    const aiFormData = new FormData();
    const fileBlob = new Blob([buffer], { type: file.type });
    aiFormData.append("files", fileBlob, file.name);
    aiFormData.append("userId", userId);
    aiFormData.append("documentIds", JSON.stringify([documentId]));
    if (description) aiFormData.append("description", description);

    const response = await fetch(`${aiServiceUrl}/api/v1/documents/upload`, {
      method: "POST",
      headers: { "X-API-Key": aiApiKey },
      body: aiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Preserve 4xx/5xx class in the message so API routes can map status codes.
      throw new Error(`AI service error ${response.status}: ${errorText}`);
    }

    const result = (await response.json()) as {
      processing_status: string;
      documents: Array<{ document_id: string; status: string; chunks?: number; content?: string }>;
    };
    const documentInfo = result.documents[0];

    if (result.processing_status === "BACKGROUND") {
      await prisma.document.update({
        where: { id: createdDocument.id },
        data: {
          aiDocumentId: documentInfo.document_id,
          qdrantDocumentId: documentId,
          status: "PROCESSING",
        },
      });
    } else {
      await prisma.document.update({
        where: { id: createdDocument.id },
        data: {
          aiDocumentId: documentInfo.document_id,
          qdrantDocumentId: documentId,
          content: documentInfo.content,
          status: "PROCESSED",
          isProcessed: true,
          processedAt: new Date(),
        },
      });
    }

    const updatedDoc = await prisma.document.findUnique({
      where: { id: createdDocument.id },
    });

    const finalStatus = result.processing_status === "BACKGROUND" ? "PROCESSING" : "PROCESSED";
    return {
      document: { ...updatedDoc, processingStatus: finalStatus } as any,
      processingStatus: finalStatus,
    };
  } catch (error) {
    if (createdDocument) {
      try {
        await prisma.document.delete({ where: { id: createdDocument.id } });
      } catch (e) {
      }
    }
    if (uploadedFileUrl) {
      try {
        await s3Service.deleteDocument(uploadedFileUrl);
      } catch (e) {
      }
    }
    throw error;
  }
}

/**
 * Core document download logic - returns file buffer for a document.
 * Caller is responsible for auth (ensuring the requester can access this document).
 * Uses fileUrl (S3 key) or fileName - S3 service handles the documents/ prefix.
 */
export async function getDocumentDownloadBuffer(
  document: { fileName?: string | null; fileUrl?: string | null; fileType: string; originalName: string }
): Promise<Buffer> {
  const s3Key = document.fileUrl || document.fileName;
  if (!s3Key) {
    throw new Error("Document file not found");
  }
  return s3Service.getDocumentAsBuffer(s3Key);
}
