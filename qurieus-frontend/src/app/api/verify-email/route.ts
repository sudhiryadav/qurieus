import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json("Verification token is required", { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        verification_token: token,
        verification_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      // Try to find user by token (even if expired or already used)
      const userByToken = await prisma.user.findFirst({
        where: { verification_token: token },
      });
      if (userByToken && userByToken.is_verified) {
        return NextResponse.json({ message: "Email already verified", email: userByToken.email }, { status: 200 });
      }
      return NextResponse.json("Invalid or expired verification token", { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        verification_token: null,
        verification_expires: null,
      },
    });

    return NextResponse.json({ message: "Email verified successfully", email: user.email }, { status: 200 });
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json("Error verifying email", { status: 500 });
  }
} 