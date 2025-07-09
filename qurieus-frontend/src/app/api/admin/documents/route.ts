import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import axiosInstance from "@/lib/axios";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/utils/prismaDB";

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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only fetch documents from the local database
    const documents = await prisma.document.findMany({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch documents" },
      { status: error.response?.status || 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST request received");
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate max docs
    const maxDocsError = await validateMaxDocs(session.user.id, files.length);
    if (maxDocsError) {
      return NextResponse.json({ error: maxDocsError.error }, { status: maxDocsError.status });
    }

    // Validate max storage
    const maxStorageError = await validateMaxStorage(session.user.id, files);
    if (maxStorageError) {
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
        return NextResponse.json(
          {
            error: `File ${file.name} exceeds the ${process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB}MB size limit`,
          },
          { status: 400 },
        );
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} is not supported` },
          { status: 400 },
        );
      }
    }

    // Check if using Modal.com persistent storage
    const useModalPersistent = process.env.USE_MODAL_PERSISTENT_STORAGE === 'true';
    const modalApiUrl = process.env.MODAL_UPLOAD_DOCUMENT_URL;

    if (useModalPersistent && modalApiUrl) {
      // Process with Modal.com
      const modalResponse = await processWithModal(files, description, category, session.user);
      const data = await modalResponse.json();
      const errorResults = data.results.filter((result: any) => !result.success);
      if (errorResults.length > 0) {
        // Log errors in DB for each failed file
        for (const errorResult of errorResults) {
          await prisma.document.create({
            data: {
              modalDocumentId: errorResult.document_id,
              title: errorResult.filename.replace(/\.[^/.]+$/, ""),
              fileName: errorResult.filename.replace(/\.[^/.]+$/, ""),
              originalName: errorResult.filename,
              fileType: errorResult.filename.split('.').pop()?.toLowerCase() || '',
              fileSize: files.find(f => f.name === errorResult.filename)?.size || 0,
              userId: session.user.id,
              content: `Upload failed: ${errorResult.error}`,
              description: description || "",
              category: category || "",
              uploadedAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }
        // Return generic error to frontend
        return NextResponse.json(
          { error: "One or more files failed to upload. Please try again or contact support." },
          { status: 500 }
        );
      }
      // All files succeeded
      return NextResponse.json(data);
    } else {
      // Process with backend FastAPI
      return await processWithBackend(files, description, category, session.user, req);
    }
  } catch (error: any) {
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
}

async function processWithModal(files: File[], description: string, category: string, user: any) {
  const modalApiUrl = process.env.MODAL_UPLOAD_DOCUMENT_URL!;
  let totalChunks = 0;
  const results = [];

  // Process each file
  for (const file of files) {
    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Content = buffer.toString('base64');

      // Get file extension
      const fileName = file.name;
      const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

      // Send to Modal.com persistent service
      const response = await fetch(modalApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.MODAL_DOT_COM_X_API_KEY || '',
        },
        body: JSON.stringify({
          file_content: base64Content,
          file_extension: fileExtension,
          original_filename: fileName,
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Modal.com service error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      totalChunks += result.chunks_processed || 0;

      // Store file metadata in database for validation and tracking
      await prisma.document.create({
        data: {
          modalDocumentId: result.document_id,
          title: fileName.replace(fileExtension, ""),
          fileName: fileName.replace(fileExtension, ""),
          originalName: fileName,
          fileType: fileExtension.toLowerCase().replace('.', ''),
          fileSize: file.size,
          userId: user.id,
          content: `Processed by Modal.com - ${result.chunks_processed} chunks`,
          description: description || "",
          category: category || "",
          uploadedAt: new Date(),
          updatedAt: new Date(),
        },
      });

      results.push({
        filename: fileName,
        success: true,
        chunks_processed: result.chunks_processed,
        document_id: result.document_id,
      });

    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      results.push({
        filename: file.name,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  const processedFiles = files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
  }));

  return NextResponse.json({
    message: `Successfully processed ${files.length} files using Modal.com persistent storage`,
    files: processedFiles,
    total_chunks: totalChunks,
    results,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
}

async function processWithBackend(files: File[], description: string, category: string, user: any, req: NextRequest) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
    raw: true,
  });

  if (!token) {
    return NextResponse.json(
      { error: "Authentication token not found" },
      { status: 401 },
    );
  }

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
    `${process.env.BACKEND_URL}/api/v1/admin/documents/upload`,
    backendFormData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    },
  );

  if (backendResponse.status !== 200 || !backendResponse.data) {
    const errorText = backendResponse.data.text();
    let errorDetail;

    try {
      const errorData = JSON.parse(errorText);
      errorDetail =
        errorData.detail || errorData.message || backendResponse.statusText;
    } catch (e) {
      errorDetail = errorText || backendResponse.statusText;
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

  const processedFiles = files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
  }));

  return NextResponse.json({
    message: "Files uploaded successfully",
    files: processedFiles,
    backendResponse: data,
  });
}


