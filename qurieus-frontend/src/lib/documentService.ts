import { prisma } from "@/utils/prismaDB";
import { logger } from "@/lib/logger";

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
      logger.warn("Document Service: Target user not found", { targetUserId: userId });
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
