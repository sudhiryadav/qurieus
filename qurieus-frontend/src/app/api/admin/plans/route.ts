import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import axios from "@/lib/axios";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const GET = RequireRoles([UserRole.SUPER_ADMIN])(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/admin/plans`,
      {
        params: {
          page,
          limit,
          search,
          userId: session!.user!.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch plans" },
      { status: error.response?.status || 500 }
    );
  }
});

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);

    const body = await request.json();
    const { name, description, price, features, interval } = body;

    if (!name || !price || !interval) {
      return NextResponse.json(
        { error: "Name, price and interval are required" },
        { status: 400 }
      );
    }

    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/admin/plans`,
      {
        name,
        description,
        price,
        features,
        interval,
      },
      {
        params: {
          userId: session!.user!.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to create plan" },
      { status: error.response?.status || 500 }
    );
  }
});

export const PUT = RequireRoles([UserRole.SUPER_ADMIN])(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);

    const body = await request.json();
    const { planId, name, description, price, features, interval, isActive } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const { data } = await axios.put(
      `${process.env.BACKEND_URL}/api/v1/admin/plans/${planId}`,
      {
        name,
        description,
        price,
        features,
        interval,
        isActive,
      },
      {
        params: {
          userId: session!.user!.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to update plan" },
      { status: error.response?.status || 500 }
    );
  }
});

export const DELETE = RequireRoles([UserRole.SUPER_ADMIN])(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("planId");

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const { data } = await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/admin/plans/${planId}`,
      {
        params: {
          userId: session!.user!.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to delete plan" },
      { status: error.response?.status || 500 }
    );
  }
}); 