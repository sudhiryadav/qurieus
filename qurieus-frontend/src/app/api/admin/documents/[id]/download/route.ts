import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

export async function GET(req: NextRequest) {
  // Extract the id param from the URL
  const id = req.nextUrl.pathname.split("/").pop();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const document = await prisma.document.findUnique({
    where: {
      id,
      userId: session.user.id, // Ensure user owns the document
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Set appropriate headers for file download
  const headers = new Headers();
  headers.set('Content-Type', document.fileType || 'application/octet-stream');
  headers.set('Content-Disposition', `attachment; filename="${document.fileName}"`);

  // Return the file data
  return new NextResponse(document.content, {
    headers,
  });
} 