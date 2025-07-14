import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import axios from "@/lib/axios";
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

export const GET = RequireRoles([UserRole.SUPER_ADMIN])(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);

    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/admin/settings`,
      {
        params: {
          userId: session!.user!.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch settings" },
      { status: error.response?.status || 500 }
    );
  }
});

export const PUT = RequireRoles([UserRole.SUPER_ADMIN])(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { error: "Settings are required" },
        { status: 400 }
      );
    }

    const { data } = await axios.put(
      `${process.env.BACKEND_URL}/api/v1/admin/settings`,
      {
        settings,
      },
      {
        params: {
          userId: session!.user!.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to update settings" },
      { status: error.response?.status || 500 }
    );
  }
}); 