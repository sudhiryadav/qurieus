import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const DELETE = RequireRoles([UserRole.SUPER_ADMIN])(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  console.log("DELETE request for document ID:", id);

  const session = await getServerSession(authOptions);

  try {
    // First check if the document exists and belongs to the user
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
          userId: session!.user!.id,
      },
    });

    if (!existingDocument) {
        console.log("Document not found or doesn't belong to user:", { id, userId: session!.user!.id });
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete the document
    await prisma.document.delete({
      where: {
        id,
      },
    });

    console.log("Document deleted successfully:", id);
    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
} 
); 