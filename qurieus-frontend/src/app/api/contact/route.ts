import { NextResponse } from "next/server";
import axios from "@/lib/axios";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIp } from "@/utils/rateLimit";

export async function POST(request: Request) {
  const startTime = Date.now();
  const ip = getClientIp(request);
  
  try {
    if (!checkRateLimit(`contact:${ip}`, 15, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, message } = body;

    logger.info("Contact API: Processing contact form submission", { 
      name, 
      email, 
      messageLength: message?.length || 0 
    });

    if (!name || !email || !message) {
      logger.warn("Contact API: Missing required fields", { 
        hasName: !!name, 
        hasEmail: !!email, 
        hasMessage: !!message 
      });
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

    const responseTime = Date.now() - startTime;
    logger.info("Contact API: Contact form submitted successfully", { 
      name, 
      email, 
      responseTime 
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Contact API: Error sending contact message", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to send message" },
      { status: error.response?.status || 500 }
    );
  }
} 