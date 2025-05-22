import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

export async function DELETE(req: NextRequest) {
  // Extract the id param from the URL
  const id = req.nextUrl.pathname.split("/").pop();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete the document only if it belongs to the user
    const document = await prisma.document.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (document.count === 0) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
} 