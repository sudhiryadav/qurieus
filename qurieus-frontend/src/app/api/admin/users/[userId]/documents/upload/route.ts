import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
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

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(async (
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) => {
  const startTime = Date.now();
  
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await context.params;

    logger.info("User Document Upload API: Processing file upload for user", { 
      adminId: session!.user!.id, 
      targetUserId: userId 
    });

    // Verify the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });

    if (!targetUser) {
      logger.warn("User Document Upload API: Target user not found", { targetUserId: userId });
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    // Support both "file" (UploadDialog, DocumentUpload) and "files" (multi-file)
    let files = formData.getAll("files") as File[];
    if (files.length === 0) {
      const singleFile = formData.get("file") as File;
      if (singleFile) files = [singleFile];
    }
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const title = formData.get("title") as string;

    logger.info("User Document Upload API: File upload validation", { 
      adminId: session!.user!.id, 
      targetUserId: userId,
      fileCount: files.length,
      fileNames: files.map(f => f.name),
      totalSize: files.reduce((sum, f) => sum + f.size, 0)
    });

    if (!files || files.length === 0) {
      logger.warn("User Document Upload API: No files provided", { targetUserId: userId });
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // File validation
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        logger.warn("User Document Upload API: File size exceeded limit", { 
          targetUserId: userId, 
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
        logger.warn("User Document Upload API: Unsupported file type", { 
          targetUserId: userId, 
          fileName: file.name, 
          fileType: file.type 
        });
        return NextResponse.json(
          { error: `File type ${file.type} is not supported` },
          { status: 400 },
        );
      }
    }

    logger.info("User Document Upload API: Processing files with backend", { 
      adminId: session!.user!.id, 
      targetUserId: userId,
      fileCount: files.length
    });

    // Create a new FormData for the backend request
    const backendFormData = new FormData();
    files.forEach(file => backendFormData.append("files", file));
    if (description) backendFormData.append("description", description);
    if (category) backendFormData.append("category", category);
    if (title) backendFormData.append("title", title);
    backendFormData.append("userId", userId);

    // Process with backend
    logger.info("User Document Upload API: Making backend request", {
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

    logger.info("User Document Upload API: Backend response received", {
      status: backendResponse.status,
      data: backendResponse.data
    });

    const responseTime = Date.now() - startTime;
    logger.info("User Document Upload API: Backend processing completed successfully", { 
      adminId: session!.user!.id, 
      targetUserId: userId,
      fileCount: files.length,
      responseTime 
    });
    
    return NextResponse.json(backendResponse.data);
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("User Document Upload API: Error uploading files", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    console.error("Error uploading user files:", {
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