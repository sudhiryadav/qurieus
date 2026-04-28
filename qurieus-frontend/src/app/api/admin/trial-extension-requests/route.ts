import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

/**
 * GET: List trial extension requests (pending first, then recent)
 */
export const GET = RequireRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN])(async () => {
  try {
    const requests = await prisma.trialExtensionRequest.findMany({
      orderBy: [
        { status: "asc" }, // PENDING first (alphabetically P comes before R)
        { createdAt: "desc" },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Sort so PENDING comes first
    const sorted = [...requests].sort((a, b) => {
      if (a.status === "PENDING" && b.status !== "PENDING") return -1;
      if (a.status !== "PENDING" && b.status === "PENDING") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ requests: sorted });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
