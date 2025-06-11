import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import axiosInstance from "@/lib/axios";

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
    const timeRange = searchParams.get("timeRange") || "7d";

    const response = await axiosInstance.get(`${process.env.BACKEND_URL}/api/analytics`, {
      params: {
        userId: session.user.id,
        timeRange,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch analytics" },
      { status: error.response?.status || 500 }
    );
  }
} 