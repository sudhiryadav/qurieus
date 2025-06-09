import { NextResponse } from "next/server";
import axios from "axios";

export async function GET() {
  try {
    const response = await axios.post(
      "https://api.paddle.com/client-token",
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return NextResponse.json({ token: response.data.token });
  } catch (error: any) {
    console.error("Failed to get Paddle client token:", error?.response?.data || error);
    return NextResponse.json({ error: "Failed to get Paddle client token" }, { status: 500 });
  }
} 