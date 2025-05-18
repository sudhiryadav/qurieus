import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { prisma } from "@/utils/prismaDB";
import { authOptions } from "@/utils/auth";

export async function GET(request: Request) {
  // Extract cookies from the request headers
  const cookie = request.headers.get('cookie') || '';
  console.log('Cookie header:', cookie);
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