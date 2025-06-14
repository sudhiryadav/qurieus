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
    const type = searchParams.get("type") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const { data } = await axios.get(
      `${process.env.BACKEND_URL}/api/v1/admin/notifications`,
      {
        params: {
          page,
          limit,
          search,
          type,
          startDate,
          endDate,
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch notifications" },
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
    const { title, message, type, userIds } = body;

    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Title, message and type are required" },
        { status: 400 }
      );
    }

    const { data } = await axios.post(
      `${process.env.BACKEND_URL}/api/v1/admin/notifications`,
      {
        title,
        message,
        type,
        userIds,
      },
      {
        params: {
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to create notification" },
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
    const { notificationId, title, message, type, isRead } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const { data } = await axios.put(
      `${process.env.BACKEND_URL}/api/v1/admin/notifications/${notificationId}`,
      {
        title,
        message,
        type,
        isRead,
      },
      {
        params: {
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to update notification" },
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
    const notificationId = searchParams.get("notificationId");

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const { data } = await axios.delete(
      `${process.env.BACKEND_URL}/api/v1/admin/notifications/${notificationId}`,
      {
        params: {
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to delete notification" },
      { status: error.response?.status || 500 }
    );
  }
} 