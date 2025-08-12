import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { logger } from "@/lib/logger";
import axios from "axios";

// File validation constants
const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "50") * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      logger.warn("Document Upload API: No authenticated session found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    logger.info("Document Upload API: Processing file upload for user", { 
      userId: session.user.id
    });

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;

    logger.info("Document Upload API: File upload validation", { 
      userId: session.user.id,
      fileCount: files.length,
      fileNames: files.map(f => f.name),
      totalSize: files.reduce((sum, f) => sum + f.size, 0)
    });

    if (!files || files.length === 0) {
      logger.warn("Document Upload API: No files provided", { userId: session.user.id });
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // File validation
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        logger.warn("Document Upload API: File size exceeded limit", { 
          userId: session.user.id, 
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
        logger.warn("Document Upload API: Unsupported file type", { 
          userId: session.user.id, 
          fileName: file.name, 
          fileType: file.type 
        });
        return NextResponse.json(
          { error: `File type ${file.type} is not supported` },
          { status: 400 },
        );
      }
    }

    logger.info("Document Upload API: Processing files with FastAPI backend", { 
      userId: session.user.id,
      fileCount: files.length
    });

    // Create a new FormData for the FastAPI backend request
    const backendFormData = new FormData();
    files.forEach(file => backendFormData.append("files", file));
    if (description) backendFormData.append("description", description);
    if (category) backendFormData.append("category", category);
    backendFormData.append("userId", session.user.id);

    // Process with FastAPI backend
    logger.info("Document Upload API: Making FastAPI backend request", {
      backendUrl: `${process.env.BACKEND_URL}/api/v1/documents/upload`,
      apiKeySet: !!process.env.BACKEND_API_KEY,
      formDataEntries: Array.from(backendFormData.entries()).map(([key, value]) => ({
        key,
        type: typeof value,
        isFile: value instanceof File,
        fileName: value instanceof File ? value.name : undefined
      }))
    });

    const backendResponse = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/documents/upload`,
      backendFormData,
      {
        headers: {
          "X-API-Key": process.env.BACKEND_API_KEY!,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    logger.info("Document Upload API: FastAPI backend response received", {
      status: backendResponse.status,
      data: backendResponse.data
    });

    const responseTime = Date.now() - startTime;
    logger.info("Document Upload API: FastAPI backend processing completed successfully", { 
      userId: session.user.id,
      fileCount: files.length,
      responseTime 
    });
    
    return NextResponse.json(backendResponse.data);
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Document Upload API: Error uploading files", { 
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
}

