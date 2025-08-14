import axiosInstance from "@/lib/axios";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { authOptions } from "@/utils/auth";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// Maximum file size (10MB)
// Convert MB to bytes (1MB = 1024 * 1024 bytes)
const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) || 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "text/markdown",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

async function validateMaxDocs(userId: string, filesCount: number) {
  const subscription = await prisma.userSubscription.findFirst({
    where: { userId, status: 'active' },
    include: { plan: true },
  });
  const maxDocs = subscription?.plan?.maxDocs ?? null;
  const currentDocCount = await prisma.document.count({ where: { userId } });
  if (maxDocs !== null && currentDocCount + filesCount > maxDocs) {
    return {
      error: `You can only upload up to ${maxDocs} documents on your current plan. You already have ${currentDocCount}.`,
      status: 403,
    };
  }
  return null;
}

async function validateMaxStorage(userId: string, files: File[]) {
  const subscription = await prisma.userSubscription.findFirst({
    where: { userId },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });
  const maxStorageMB = subscription?.plan?.maxStorageMB ?? null;
  if (maxStorageMB !== null) {
    const currentStorage = await prisma.document.aggregate({
      where: { userId },
      _sum: { fileSize: true },
    });
    const currentStorageBytes = currentStorage._sum.fileSize || 0;
    const newFilesSize = files.reduce((sum, file) => sum + file.size, 0);
    const totalAfterUpload = currentStorageBytes + newFilesSize;
    const maxStorageBytes = maxStorageMB * 1024 * 1024;
    if (totalAfterUpload > maxStorageBytes) {
      return {
        error: `Uploading these files would exceed your plan's storage limit of ${maxStorageMB}MB.`,
        currentUsageMB: (currentStorageBytes / 1024 / 1024).toFixed(2),
        attemptedUploadMB: (newFilesSize / 1024 / 1024).toFixed(2),
        status: 403,
      };
    }
  }
  return null;
}

export const GET = RequireRoles([UserRole.SUPER_ADMIN, UserRole.USER])(async (request: Request) => {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    const session = await getServerSession(authOptions);
    const userId = session!.user!.id;

    logger.info("Documents API: Fetching documents", { userId });

    // Only fetch documents from the local database
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
        // Qdrant/AI Integration fields
        qdrantDocumentId: true,
        chunkCount: true,
        isProcessed: true,
        processedAt: true,
        metadata: true,
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    const responseTime = Date.now() - startTime;
    logger.info("Documents API: Documents fetched successfully", { 
      userId, 
      documentCount: documents.length,
      responseTime 
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Documents API: Error fetching documents", { 
      userId, 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch documents" },
      { status: error.response?.status || 500 },
    );
  }
});

export const POST = RequireRoles([UserRole.SUPER_ADMIN, UserRole.USER])(async (req: NextRequest) => {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    logger.info("Documents API: Processing file upload request");
    const session = await getServerSession(authOptions);

    userId = session!.user!.id;
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;

    logger.info("Documents API: File upload validation", { 
      userId, 
      fileCount: files.length,
      fileNames: files.map(f => f.name),
      totalSize: files.reduce((sum, f) => sum + f.size, 0)
    });

    if (!files || files.length === 0) {
      logger.warn("Documents API: No files provided", { userId });
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate max docs
    const maxDocsError = await validateMaxDocs(session!.user!.id, files.length);
    if (maxDocsError) {
      logger.warn("Documents API: Max docs validation failed", { 
        userId, 
        error: maxDocsError.error 
      });
      return NextResponse.json({ error: maxDocsError.error }, { status: maxDocsError.status });
    }

    // Validate max storage
    const maxStorageError = await validateMaxStorage(session!.user!.id, files);
    if (maxStorageError) {
      logger.warn("Documents API: Max storage validation failed", { 
        userId, 
        error: maxStorageError.error,
        currentUsageMB: maxStorageError.currentUsageMB,
        attemptedUploadMB: maxStorageError.attemptedUploadMB
      });
      return NextResponse.json(
        {
          error: maxStorageError.error,
          currentUsageMB: maxStorageError.currentUsageMB,
          attemptedUploadMB: maxStorageError.attemptedUploadMB,
        },
        { status: maxStorageError.status }
      );
    }

    // File validation
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        logger.warn("Documents API: File size exceeded limit", { 
          userId, 
          fileName: file.name, 
          fileSize: file.size, 
          maxSize: MAX_FILE_SIZE 
        });
        return NextResponse.json(
          {
            error: `File ${file.name} exceeds the ${process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB}MB size limit`,
          },
          { status: 400 },
        );
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        logger.warn("Documents API: Unsupported file type", { 
          userId, 
          fileName: file.name, 
          fileType: file.type 
        });
        return NextResponse.json(
          { error: `File type ${file.type} is not supported` },
          { status: 400 },
        );
      }
    }

    logger.info("Documents API: Processing files with backend (Qdrant integration)", { 
      userId, 
      fileCount: files.length
    });

    // Process with backend (Qdrant integration)
    const result = await processWithBackend(files, description, category, session!.user!, req);
    
    const responseTime = Date.now() - startTime;
    logger.info("Documents API: Backend processing completed successfully", { 
      userId, 
      fileCount: files.length,
      responseTime 
    });
    
    return result;
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Documents API: Error uploading files", { 
      userId, 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    console.error("Error uploading files:", {
      error: error.message,
      stack: error.stack,
      cause: error.cause,
    });

    return NextResponse.json(
      {
        error: "Failed to upload files",
        details: error.message,
      },
      { status: 500 },
    );
  }
});

async function processWithBackend(files: File[], description: string, category: string, user: any, req: NextRequest) {
  const backendFormData = new FormData();
  files.forEach((file) => {
    // Create a new File object to ensure proper handling
    const fileBlob = new Blob([file], { type: file.type });
    const newFile = new File([fileBlob], file.name, { type: file.type });
    backendFormData.append("files", newFile);
  });
  backendFormData.append("userId", user.id);
  backendFormData.append("description", description || "");
  backendFormData.append("category", category || "");

  const backendResponse = await axiosInstance.post(
    `${process.env.BACKEND_URL}/api/v1/documents/upload`,
    backendFormData,
    {
      headers: {
        "X-API-Key": process.env.BACKEND_API_KEY!,
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    },
  );

  if (backendResponse.status !== 200 || !backendResponse.data) {
    let errorDetail = backendResponse.statusText;

    try {
      const errorData = backendResponse.data;
      errorDetail = errorData.detail || errorData.message || backendResponse.statusText;
    } catch (e) {
      errorDetail = backendResponse.statusText;
    }

    console.error("Upload error details:", {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      errorDetail,
      headers: Object.fromEntries(backendResponse.headers.entries()),
    });

    return NextResponse.json(
      {
        error: "Error processing document",
        details: errorDetail,
        status: backendResponse.status,
      },
      { status: backendResponse.status },
    );
  }

  const data = backendResponse.data;

  // Store processed documents in the database
  const storedDocuments = [];
  for (const processedFile of data.processed_files) {
    try {
      const document = await prisma.document.create({
        data: {
          id: processedFile.document_id,
          title: processedFile.original_filename.replace(/\.[^/.]+$/, ""), // Remove file extension
          content: processedFile.content,
          fileName: processedFile.original_filename.replace(/\.[^/.]+$/, ""),
          originalName: processedFile.original_filename,
          fileType: processedFile.file_type,
          fileSize: processedFile.file_size,
          category: category || null,
          description: description || null,
          keywords: "", // Can be extracted later if needed
          uploadedAt: new Date(processedFile.processed_at),
          metadata: processedFile.financial_analysis ? JSON.stringify(processedFile.financial_analysis) : null,
          qdrantDocumentId: processedFile.document_id, // Link to Qdrant document ID
          chunkCount: processedFile.chunks,
          isProcessed: true,
          processedAt: new Date(processedFile.processed_at),
          userId: user.id,
        },
      });
      
      // Store chunk data if available
      if (processedFile.chunk_data && processedFile.chunk_data.length > 0) {
        const chunkData = processedFile.chunk_data.map((chunk: any) => ({
          documentId: document.id,
          chunkIndex: chunk.chunk_index,
          content: chunk.content,
          contentLength: chunk.content_length,
          qdrantPointId: chunk.qdrant_point_id,
          embeddingVector: chunk.embedding_vector,
        }));
        
        await prisma.documentChunk.createMany({
          data: chunkData,
        });
        
        logger.info("Documents API: Chunks stored in database", { 
          userId: user.id, 
          documentId: document.id,
          chunkCount: chunkData.length 
        });
      }
      
      storedDocuments.push(document);
      logger.info("Documents API: Document stored in database", { 
        userId: user.id, 
        documentId: document.id,
        fileName: document.fileName 
      });
    } catch (dbError) {
      logger.error("Documents API: Failed to store document in database", { 
        userId: user.id, 
        documentId: processedFile.document_id,
        error: dbError instanceof Error ? dbError.message : String(dbError)
      });
      // Continue with other documents even if one fails
    }
  }

  const processedFiles = storedDocuments.map((doc) => ({
    id: doc.id,
    name: doc.originalName,
    size: doc.fileSize,
    type: doc.fileType,
    uploadedAt: doc.uploadedAt.toISOString(),
  }));

  return NextResponse.json({
    message: data.message,
    files: processedFiles,
    processed_files: processedFiles, // Add this for compatibility
    totalChunks: data.total_chunks,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
}


