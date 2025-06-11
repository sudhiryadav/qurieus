import { NextResponse } from "next/server";
import axios from "@/lib/axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const response = await axios.post(`${process.env.BACKEND_URL}/api/contact`, {
      name,
      email,
      message,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error sending contact message:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to send message" },
      { status: error.response?.status || 500 }
    );
  }
} 