import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';
import { logger } from "@/lib/logger";

interface DocumentGenerationRequest {
  content: string;
  sourceUrl: string;
  title: string;
  description: string;
}

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    const { content, sourceUrl, title, description }: DocumentGenerationRequest = await req.json();

    // Create document data
    const documentData = {
      title: title,
      description: description,
      content: content,
      source_url: sourceUrl,
      generated_by: session?.user?.email || 'admin',
      generated_at: new Date().toISOString(),
      content_length: content.length
    };

    logger.info(`Generated document from website content: ${title}`, {
      title,
      sourceUrl,
      contentLength: content.length,
      generatedBy: session?.user?.email
    });

    // In a real implementation, you would:
    // 1. Save the document to your database
    // 2. Process it for embeddings
    // 3. Make it available for user queries
    
    // For now, we'll just return the document data
    return NextResponse.json({
      message: "Document generated successfully",
      document: documentData
    });

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}); 