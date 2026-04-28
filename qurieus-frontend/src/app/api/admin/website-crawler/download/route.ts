import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

interface DownloadRequest {
  content: string;
  sourceUrl: string;
  format: string;
}

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
  try {
    const { content, sourceUrl, format }: DownloadRequest = await req.json();

    // Create file content
    const fileContent = `Website Content
Source: ${sourceUrl}
Generated: ${new Date().toISOString()}

${content}
`;

    // Create response with file download
    const response = new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename=crawled-content-${new Date().toISOString().split('T')[0]}.txt`,
      },
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}); 