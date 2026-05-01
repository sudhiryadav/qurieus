import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import { UserRole } from '@prisma/client';
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { sendEmail } from '@/lib/email';

export const POST = RequireRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN])(async (request: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const { userIds, subject, html } = await request.json();
    const MAX_RECIPIENTS = 200;
    const MAX_SUBJECT_LENGTH = 180;
    const MAX_HTML_LENGTH = 100_000;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0 || !subject || !html) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (userIds.length > MAX_RECIPIENTS) {
      return NextResponse.json({ error: `Too many recipients (max ${MAX_RECIPIENTS})` }, { status: 400 });
    }
    if (typeof subject !== "string" || subject.trim().length > MAX_SUBJECT_LENGTH) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }
    if (typeof html !== "string" || html.length > MAX_HTML_LENGTH) {
      return NextResponse.json({ error: "Invalid email body" }, { status: 400 });
    }
    
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        role: { not: 'AGENT' },
        is_active: true,
      },
      select: { email: true, name: true },
    });

    if (users.length === 0) {
      return NextResponse.json({ error: 'No valid users found' }, { status: 400 });
    }

    // Send emails in batches of 10 for better performance
    const batchSize = 10;
    const batches = [];
    for (let i = 0; i < users.length; i += batchSize) {
      batches.push(users.slice(i, i + batchSize));
    }

    let successful = 0;
    let failed = 0;
    const errors: any[] = [];

    // Process batches sequentially to avoid overwhelming the SMTP server
    for (const batch of batches) {
      const batchResults = await Promise.allSettled(
        batch.map(user =>
          sendEmail({
            to: user.email,
            subject,
            html,
            context: { userName: user.name },
          })
        )
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful++;
        } else {
          failed++;
          errors.push({
            email: batch[index].email,
            error: result.reason?.message || 'Unknown error'
          });
        }
      });

      // Small delay between batches to be respectful to SMTP server
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (failed > 0) {
    }

    return NextResponse.json({ 
      success: true, 
      sent: successful,
      failed,
      total: users.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to send emails'
    }, { status: 500 });
  }
}); 