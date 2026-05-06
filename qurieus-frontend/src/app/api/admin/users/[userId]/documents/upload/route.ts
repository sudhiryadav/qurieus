import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";
import { logger } from "@/lib/logger";
import { uploadDocument } from "@/lib/documentService";

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(async (
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) => {
  const startTime = Date.now();
  const maxFilesPerRequest = 10;

  try {
    const session = await getServerSession(authOptions);
    const { userId: targetUserId } = await context.params;

    logger.info("User Document Upload API: Processing file upload for user", {
      adminId: session!.user!.id,
      targetUserId,
    });

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();
    let files = formData.getAll("files") as File[];
    if (files.length === 0) {
      const singleFile = formData.get("file") as File;
      if (singleFile) files = [singleFile];
    }
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const title = formData.get("title") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }
    if (files.length > maxFilesPerRequest) {
      return NextResponse.json(
        { error: `Too many files in one request. Maximum is ${maxFilesPerRequest}.` },
        { status: 400 }
      );
    }

    const results: Array<{ document: any }> = [];

    for (const file of files) {
      const { document } = await uploadDocument({
        file,
        userId: targetUserId,
        title,
        description,
        category,
      });
      results.push({ document });
    }

    const responseTime = Date.now() - startTime;
    logger.info("User Document Upload API: Upload completed successfully", {
      adminId: session!.user!.id,
      targetUserId,
      fileCount: files.length,
      responseTime,
    });

    if (results.length === 1) {
      return NextResponse.json({
        success: true,
        document: results[0].document,
        message: "Document uploaded successfully",
      });
    }

    return NextResponse.json({
      success: true,
      documents: results.map((r) => r.document),
      message: `${results.length} documents uploaded successfully`,
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("User Document Upload API: Error uploading files", {
      error: error.message,
      responseTime,
      stack: error.stack,
    });

    const isClientError =
      error.message?.includes("exceeds") ||
      error.message?.includes("not supported") ||
      error.message?.includes("not found") ||
      error.message?.includes("empty") ||
      error.message?.includes("AI service error 4");
    const status = isClientError ? 400 : 500;

    return NextResponse.json(
      {
        error: "Failed to upload files",
        details: error.message,
      },
      { status }
    );
  }
});
