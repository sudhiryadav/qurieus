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
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
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
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
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

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      raw: true, // Important: get the raw token string
    });

    if (!token) {
      return NextResponse.json(
        { error: "Authentication token not found" },
        { status: 401 },
      );
    }

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

    const backendFormData = new FormData();
    files.forEach((file) => {
      // Create a new File object to ensure proper handling
      const fileBlob = new Blob([file], { type: file.type });
      const newFile = new File([fileBlob], file.name, { type: file.type });
      backendFormData.append("files", newFile);
    });
    backendFormData.append("userId", session.user.id);
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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 },
      );
    }

    const { data } = await axiosInstance.delete(
      `${process.env.BACKEND_URL}/api/v1/admin/documents/${documentId}`,
      {
        params: {
          userId: session.user.id,
        },
      },
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to delete document" },
      { status: error.response?.status || 500 },
    );
  }
}
