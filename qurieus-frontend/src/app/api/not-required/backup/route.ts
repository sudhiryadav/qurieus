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
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/admin/backup`,
      {
        params: {
          page,
          limit,
          search,
          startDate,
          endDate,
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching backups:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch backups" },
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/admin/backup`,
      {
        name,
        description,
      },
      {
        params: {
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error creating backup:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to create backup" },
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
    const backupId = searchParams.get("backupId");

    if (!backupId) {
      return NextResponse.json(
        { error: "Backup ID is required" },
        { status: 400 }
      );
    }

    const { data } = await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/admin/backup/${backupId}`,
      {
        params: {
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error deleting backup:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to delete backup" },
      { status: error.response?.status || 500 }
    );
  }
} 