import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { sendConfigurationNotificationEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ apiKey: string }> }
) {
  const startTime = Date.now();
  
  try {
    const { apiKey } = await params;

    logger.info("Documents Check API: Checking documents for API key", { apiKey });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: apiKey },
      select: { email: true }
    });

    if (!user) {
      logger.warn("Documents Check API: Invalid API key", { apiKey });
      return NextResponse.json(
        { error: "Invalid API Key" },
        { status: 404 }
      );
    }

    // Check for documents
    const documentCount = await prisma.document.count({
      where: { userId: apiKey }
    });

    const hasDocuments = documentCount > 0;

    logger.info("Documents Check API: Document check completed", { 
      apiKey, 
      hasDocuments, 
      documentCount 
    });

    if (!hasDocuments) {
      // Send notification emails
      try {
        if (user.email) {
          logger.info("Documents Check API: Sending configuration notification email", { 
            apiKey, 
            userEmail: user.email 
          });
          
          await sendConfigurationNotificationEmail({
              userId: apiKey,
            query: "No documents found",
              timestamp: new Date().toISOString(),
            adminEmail: process.env.ADMIN_EMAIL || '',
            userEmail: user.email
          });
        }
      } catch (error) {
        logger.error("Documents Check API: Error sending configuration notification", { 
          apiKey, 
          error: error instanceof Error ? error.message : String(error) 
        });
        console.error("Error sending configuration notification:", error);
      }
    }

    const responseTime = Date.now() - startTime;
    logger.info("Documents Check API: Request completed successfully", { 
      apiKey, 
      hasDocuments, 
      responseTime 
    });

    return NextResponse.json({ hasDocuments });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Documents Check API: Error checking documents", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    console.error("Error checking documents:", error);
    return NextResponse.json(
      { error: "Failed to check documents" },
      { status: 500 }
    );
  }
} 