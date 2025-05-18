import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';

export async function POST(req: NextRequest) {
  try {
    // Get session and IP address
    const session = await getServerSession(authOptions);
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Parse request body
    const { message, userId } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check that we have either a session or a userId
    if (!session?.user && !userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Use authenticated user ID if available, otherwise use provided userId
    const authenticatedUserId = session?.user?.id || userId;
    
    // Call FastAPI endpoint to process the query
    const backendUrl = `${process.env.BACKEND_URL}/api/query`;
    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`,
      },
      body: JSON.stringify({
        query: message,
        userId: authenticatedUserId,
      }),
    });
    
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      throw new Error(`Backend API error: ${errorData.detail || backendResponse.statusText}`);
    }
    
    const response = await backendResponse.json();

    // Get any extracted keywords from the response
    const keywords = response.keywords || [];
    
    // Store the conversation in the database
    const userMessage = await prisma.chatMessage.create({
      data: {
        content: message,
        role: 'user',
        userId: authenticatedUserId,
        ipAddress: clientIp,
        keywords: keywords.join(', '),
      },
    });

    // Store the assistant's response
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        content: response.message,
        role: 'assistant',
        userId: authenticatedUserId,
        ipAddress: clientIp,
        keywords: keywords.join(', '),
        responseTime: response.responseTime || 0,
      },
    });

    return NextResponse.json({
      message: response.message,
      messageId: assistantMessage.id,
      keywords: keywords,
    });
  } catch (error: any) {
    console.error('Error processing chat message:', error);
    return NextResponse.json(
      { error: `Failed to process message: ${error.message}` },
      { status: 500 }
    );
  }
} 