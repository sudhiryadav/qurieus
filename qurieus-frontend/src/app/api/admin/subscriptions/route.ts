import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const GET = RequireRoles([UserRole.SUPER_ADMIN])(async (request: NextRequest) => {
    // Get all the subscriptions from the database
    const subscriptions = await prisma.userSubscription.findMany({
      include: {
        user: true,
        plan: true,
      },
    });

    return NextResponse.json(subscriptions);
});