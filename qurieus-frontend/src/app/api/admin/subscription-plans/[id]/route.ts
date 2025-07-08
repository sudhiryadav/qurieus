import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user?.email! } });
  if (!user || user.role !== "SUPER_ADMIN") return new NextResponse("Forbidden", { status: 403 });

  const body = await req.json();
  const { name, description, price, currency, features, isActive, idealFor, keyLimits, maxDocs, maxStorageMB, maxQueriesPerDay } = body;

  try {
    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name,
        description,
        price,
        currency,
        features,
        isActive,
        idealFor,
        keyLimits,
        maxDocs,
        maxStorageMB,
        maxQueriesPerDay,
      },
    });
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 