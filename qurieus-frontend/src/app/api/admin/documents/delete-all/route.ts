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
    // Delete all documents for the current user
    await prisma.document.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ message: "All documents deleted successfully" });
  } catch (error) {
    console.error("Error deleting all documents:", error);
    return NextResponse.json(
      { error: "Failed to delete all documents" },
      { status: 500 }
    );
  }
} 