import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { sendConfigurationNotificationEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { requireUser } from "@/utils/roleGuards";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

const maskApiKey = (value: string) => {
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ apiKey: string }> }
) {
  return requireUser(request as any, async (request: Request) => {
  const startTime = Date.now();
  
  try {
    const { apiKey } = await params;
    const session = await getServerSession(authOptions);
    const requesterId = session?.user?.id;
    const requesterRole = session?.user?.role;

    const isPrivileged = requesterRole === "ADMIN" || requesterRole === "SUPER_ADMIN";
    if (!requesterId || (!isPrivileged && requesterId !== apiKey)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    // Check if user exists
    const userRecord = await prisma.user.findUnique({
      where: { id: apiKey },
      select: { email: true }
    });

    if (!userRecord) {
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
      apiKey: maskApiKey(apiKey), 
      hasDocuments, 
      documentCount 
    });

    if (!hasDocuments) {
      // Send notification emails
      try {
        if (userRecord.email) {
          logger.info("Documents Check API: Sending configuration notification email", { 
            apiKey: maskApiKey(apiKey), 
            userEmail: userRecord.email 
          });
          
          await sendConfigurationNotificationEmail({
              userId: apiKey,
            query: "No documents found",
              timestamp: new Date().toISOString(),
            adminEmail: process.env.ADMIN_EMAIL || '',
            userEmail: userRecord.email
          });
        }
      } catch (error) {
        logger.error("Documents Check API: Error sending configuration notification", { 
          apiKey: maskApiKey(apiKey), 
          error: error instanceof Error ? error.message : String(error) 
        });
      }
    }

    const responseTime = Date.now() - startTime;
    logger.info("Documents Check API: Request completed successfully", { 
      apiKey: maskApiKey(apiKey), 
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
    
    return NextResponse.json(
      { error: "Failed to check documents" },
      { status: 500 }
    );
  }
  });
} 