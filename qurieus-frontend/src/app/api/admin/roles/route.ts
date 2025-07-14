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
      `${process.env.BACKEND_URL}/api/v1/admin/roles`,
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
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch roles" },
      { status: error.response?.status || 500 }
    );
  }
});

export const POST = RequireRoles([UserRole.SUPER_ADMIN])(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);

    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name || !permissions) {
      return NextResponse.json(
        { error: "Name and permissions are required" },
        { status: 400 }
      );
    }

    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/admin/roles`,
      {
        name,
        description,
        permissions,
      },
      {
        params: {
          userId: session!.user!.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to create role" },
      { status: error.response?.status || 500 }
    );
  }
});

export const PUT = RequireRoles([UserRole.SUPER_ADMIN])(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);

    const body = await request.json();
    const { roleId, name, description, permissions, isActive } = body;

    if (!roleId) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 }
      );
    }

    const { data } = await axios.put(
      `${process.env.BACKEND_URL}/api/v1/admin/roles/${roleId}`,
      {
        name,
        description,
        permissions,
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
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to update role" },
      { status: error.response?.status || 500 }
    );
  }
});

export const DELETE = RequireRoles([UserRole.SUPER_ADMIN])(async (request: Request) => {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get("roleId");

    if (!roleId) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 }
      );
    }

    const { data } = await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/admin/roles/${roleId}`,
      {
        params: {
          userId: session!.user!.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to delete role" },
      { status: error.response?.status || 500 }
    );
  }
}); 