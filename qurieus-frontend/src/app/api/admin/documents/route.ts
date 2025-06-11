import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/utils/prismaDB";
import { authOptions } from "@/utils/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  // Get documents from database for the user
  const documents = await prisma.document.findMany({
    where: {
      userId: userId
    }
  });
  return NextResponse.json({ documents });
} 