import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { authOptions } from "@/utils/auth";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const GET = RequireRoles([UserRole.USER,UserRole.SUPER_ADMIN])(async () => {
  try {
    const session = await getServerSession(authOptions);

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: session!.user!.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(null);
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}); 