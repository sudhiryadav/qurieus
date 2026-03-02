import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { uploadDocument } from "@/lib/documentService";

export async function POST(request: NextRequest) {
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

    const userId = session.user.id;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;

    if (!file) {
      logger.warn("Document Upload API: No file provided", { userId });
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    logger.info("Document Upload API: Starting upload", {
      userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    const { document } = await uploadDocument({
      file,
      userId,
      title,
      description,
      category,
    });

    const responseTime = Date.now() - startTime;
    logger.info("Document Upload API: Upload completed successfully", {
      userId,
      documentId: document.id,
      responseTime,
    });

    return NextResponse.json({
      success: true,
      document,
      message: "Document uploaded successfully",
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Document Upload API: Upload failed", {
      error: error.message,
      responseTime,
      stack: error.stack,
    });

    const status = error.message?.includes("exceeds") || error.message?.includes("not supported") ? 400 : 500;
    return NextResponse.json(
      { error: error.message || "Failed to upload document" },
      { status }
    );
  }
}

