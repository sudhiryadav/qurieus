import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { invalidateAnalyticsCache } from '@/utils/cache';
import axiosInstance from "@/lib/axios";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const { data } = await axiosInstance.get(
      `${process.env.BACKEND_URL}/api/admin/analytics`,
      {
        params: {
          startDate,
          endDate,
          userId: session.user.id,
        },
      }
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to fetch analytics" },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const { type, data } = await req.json();

    // Invalidate cache when new data is added
    await invalidateAnalyticsCache(userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating analytics:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 