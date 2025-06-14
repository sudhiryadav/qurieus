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
    const action = searchParams.get("action") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/admin/audit-logs`,
      {
        params: {
          page,
          limit,
          search,
          action,
          startDate,
          endDate,
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch audit logs" },
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
    const before = searchParams.get("before");

    if (!before) {
      return NextResponse.json(
        { error: "Before date is required" },
        { status: 400 }
      );
    }

    const { data } = await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/admin/audit-logs`,
      {
        params: {
          before,
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error deleting audit logs:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to delete audit logs" },
      { status: error.response?.status || 500 }
    );
  }
} 