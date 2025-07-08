import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { sendConfigurationNotificationEmail } from "@/lib/email";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ apiKey: string }> }
) {
  try {
    const { apiKey } = await params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: apiKey },
      select: { email: true }
    });

    if (!user) {
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

    if (!hasDocuments) {
      // Send notification emails
      try {
        if (user.email) {
          await sendConfigurationNotificationEmail({
              userId: apiKey,
            query: "No documents found",
              timestamp: new Date().toISOString(),
            adminEmail: process.env.ADMIN_EMAIL || '',
            userEmail: user.email
          });
        }
      } catch (error) {
        console.error("Error sending configuration notification:", error);
      }
    }

    return NextResponse.json({ hasDocuments });
  } catch (error) {
    console.error("Error checking documents:", error);
    return NextResponse.json(
      { error: "Failed to check documents" },
      { status: 500 }
    );
  }
} 