import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { userId, query, timestamp } = await request.json();

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get admin email
    const adminEmail = process.env.ADMIN_EMAIL || "admin@qurieus.com";

    // Send notification emails
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.SITE_URL || "https://qurieus.com"}/user/dashboard`;
    
    // Send to admin
    await sendEmail({
      to: adminEmail,
      subject: "System Configuration Required - No Documents Found",
      template: "configuration-notification",
      context: { 
        userId,
        query,
        timestamp,
        dashboardUrl,
      },
    });

    // Send to user
    await sendEmail({
      to: user.email,
      subject: "System Configuration Required - No Documents Found",
      template: "configuration-notification",
      context: { 
        userId,
        query,
        timestamp,
        dashboardUrl,
      },
    });

    return NextResponse.json({ message: "Notifications sent successfully" });
  } catch (error: any) {
    console.error("Error sending configuration notifications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send notifications" },
      { status: 500 }
    );
  }
} 