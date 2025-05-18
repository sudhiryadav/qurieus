import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { documentIds } = await request.json();

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: "No documents selected" },
        { status: 400 }
      );
    }

    // Delete selected documents for the current user
    await prisma.document.deleteMany({
      where: {
        id: {
          in: documentIds,
        },
        userId: session.user.id, // Ensure user owns the documents
      },
    });

    return NextResponse.json({ message: "Selected documents deleted successfully" });
  } catch (error) {
    console.error("Error deleting selected documents:", error);
    return NextResponse.json(
      { error: "Failed to delete selected documents" },
      { status: 500 }
    );
  }
} 