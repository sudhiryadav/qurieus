import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import axios from "@/lib/axios";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/admin/permissions`,
      {
        params: {
          page,
          limit,
          search,
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch permissions" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, resource, action } = body;

    if (!name || !resource || !action) {
      return NextResponse.json(
        { error: "Name, resource and action are required" },
        { status: 400 }
      );
    }

    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/admin/permissions`,
      {
        name,
        description,
        resource,
        action,
      },
      {
        params: {
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error creating permission:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to create permission" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { permissionId, name, description, resource, action, isActive } = body;

    if (!permissionId) {
      return NextResponse.json(
        { error: "Permission ID is required" },
        { status: 400 }
      );
    }

    const { data } = await axios.put(
      `${process.env.BACKEND_URL}/api/v1/admin/permissions/${permissionId}`,
      {
        name,
        description,
        resource,
        action,
        isActive,
      },
      {
        params: {
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating permission:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to update permission" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const permissionId = searchParams.get("permissionId");

    if (!permissionId) {
      return NextResponse.json(
        { error: "Permission ID is required" },
        { status: 400 }
      );
    }

    const { data } = await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/admin/permissions/${permissionId}`,
      {
        params: {
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error deleting permission:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to delete permission" },
      { status: error.response?.status || 500 }
    );
  }
} 