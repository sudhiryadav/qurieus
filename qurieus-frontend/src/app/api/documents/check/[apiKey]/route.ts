import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { sendEmail } from "@/lib/email";

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
          await sendEmail({
            to: user.email,
            subject: "System Configuration Required - No Documents Found",
            template: "configuration-notification",
            context: {
              userId: apiKey,
              timestamp: new Date().toISOString(),
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`
            }
          });

          await sendEmail({
            to: process.env.ADMIN_EMAIL || 'admin@qurieus.com',
            subject: "System Configuration Required - No Documents Found",
            template: "configuration-notification",
            context: {
              userId: apiKey,
              timestamp: new Date().toISOString(),
              dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`
            }
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