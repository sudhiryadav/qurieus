import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { authOptions } from "@/utils/auth";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const GET = RequireRoles([UserRole.USER])(async (request: Request, user?: any) => {
  try {
    const session = await getServerSession(authOptions);
    
    // Extract userId from the URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const userId = pathParts[pathParts.length - 1]; // Get the last part of the path
    
    // Additional check to ensure user can only access their own subscription
    if (session!.user!.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: "active",
      },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(null);
    }

    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}); 