import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import axios from "@/lib/axios";

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
    const { message, documentId, visitorId } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get chat history
    const effectiveVisitorId = visitorId || session.user.id;
    const { data: history } = await axios.get(
      `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/chat/history`,
      {
        params: {
          visitorId: effectiveVisitorId,
          userId: session.user.id,
          limit: 10,
        },
      }
    );

    // Query the backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/admin/documents/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.id}`,
      },
      body: JSON.stringify({
        query: message,
        document_owner_id: session.user.id,
        history: history || []
      })
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Create a transform stream to modify the response
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        try {
          const text = new TextDecoder().decode(chunk);
          const lines = text.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            const data = JSON.parse(line);
            // Only send response and done fields
            const filteredData = {
              response: data.response,
              done: data.done,
              sources: data.sources
            };
            controller.enqueue(new TextEncoder().encode(JSON.stringify(filteredData) + '\n'));
          }
        } catch (e) {
          console.error('Error transforming stream:', e);
          controller.enqueue(chunk); // Pass through original chunk if transformation fails
        }
      }
    });

    // Return the transformed response as a stream
    return new Response(response.body.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error("Error in document query:", error);
    return NextResponse.json(
      { error: error.response?.data?.error || "Failed to process query" },
      { status: error.response?.status || 500 }
    );
  }
} 