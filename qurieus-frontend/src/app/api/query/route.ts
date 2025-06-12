import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import axios from "@/lib/axios";
import { cacheGet, cacheSet, generateQueryCacheKey } from "@/utils/redis";
import { prisma } from "@/utils/prismaDB";
import { sendEmail } from "@/lib/email";

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
    const { message, documentId: apiKey, visitorId } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key is required" },
        { status: 400 }
      );
    }

    // Verify the API key (userId) exists
    const user = await prisma.user.findUnique({
      where: { id: apiKey }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid API Key" },
        { status: 404 }
      );
    }

    // Check cache first
    const cacheKey = generateQueryCacheKey(message, session.user.id);
    const cachedResponse = await cacheGet(cacheKey);
    
    if (cachedResponse) {
      // Check if cached response indicates no documents found
      const lines = cachedResponse.split('\n').filter(line => line.trim());
      let hasNoDocuments = false;
      
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response === "No relevant documents found.") {
            hasNoDocuments = true;
            break;
          }
        } catch (e) {
          console.error('Error parsing cached response:', e);
        }
      }

      if (hasNoDocuments) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: apiKey },
            select: { email: true }
          });

          if (user?.email) {
            await sendEmail({
              to: user.email,
              subject: "System Configuration Required - No Documents Found",
              template: "configuration-notification",
              context: {
                userId: apiKey,
                query: message,
                timestamp: new Date().toISOString(),
                dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`
              }
            });

            await sendEmail({
              to: process.env.ADMIN_EMAIL || 'admin@qurieus.com',
              subject: "System Configuration Required - No Documents Found",
              template: "configuration-notification",
              context: {
                userId: apiKey,
                query: message,
                timestamp: new Date().toISOString(),
                dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`
              }
            });
          }
        } catch (error) {
          console.error("Error sending configuration notification:", error);
        }

        // Track analytics for modified cached response
        const effectiveVisitorId = visitorId || session.user.id;
        const startTime = Date.now();
        
        try {
          await prisma.queryAnalytics.create({
            data: {
              userId: apiKey,
              query: message,
              response: cachedResponse,
              responseTime: 0,
              visitorId: effectiveVisitorId,
              success: true,
              error: null
            }
          });

          // Update visitor session
          await prisma.visitorSession.upsert({
            where: {
              id: effectiveVisitorId
            },
            create: {
              userId: apiKey,
              visitorId: effectiveVisitorId,
              userAgent: request.headers.get('user-agent') || 'Unknown',
              ipAddress: request.headers.get('x-forwarded-for') || 'Unknown',
              startTime: new Date(),
              endTime: new Date(),
              duration: 0,
              queries: 1
            },
            update: {
              endTime: new Date(),
              duration: {
                increment: Math.floor((Date.now() - startTime) / 1000)
              },
              queries: {
                increment: 1
              }
            }
          });
        } catch (error) {
          console.error('Error tracking analytics for cached response:', error);
        }

        return new Response(modifiedResponse, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      }

      // Track analytics for normal cached response
      const effectiveVisitorId = visitorId || session.user.id;
      const startTime = Date.now();
      
      try {
        await prisma.queryAnalytics.create({
          data: {
            userId: apiKey,
            query: message,
            response: cachedResponse,
            responseTime: 0,
            visitorId: effectiveVisitorId,
            success: true,
            error: null
          }
        });

        // Update visitor session
        await prisma.visitorSession.upsert({
          where: {
            id: effectiveVisitorId
          },
          create: {
            userId: apiKey,
            visitorId: effectiveVisitorId,
            userAgent: request.headers.get('user-agent') || 'Unknown',
            ipAddress: request.headers.get('x-forwarded-for') || 'Unknown',
            startTime: new Date(),
            endTime: new Date(),
            duration: 0,
            queries: 1
          },
          update: {
            endTime: new Date(),
            duration: {
              increment: Math.floor((Date.now() - startTime) / 1000)
            },
            queries: {
              increment: 1
            }
          }
        });
      } catch (error) {
        console.error('Error tracking analytics for cached response:', error);
      }

      return new Response(cachedResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
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

    const startTime = Date.now();

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

    // Create a transform stream to modify the response and cache it
    let responseBuffer = '';
    let success = true;
    let errorMessage: string | null = null;

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        try {
          const text = new TextDecoder().decode(chunk);
          responseBuffer += text;
          
          const lines = text.split('\n').filter(line => line.trim());
          for (const line of lines) {
            const data = JSON.parse(line);
            if (data.response === "No relevant documents found.") {
              try {
                const user = await prisma.user.findUnique({
                  where: { id: apiKey },
                  select: { email: true }
                });

                if (user?.email) {
                  await sendEmail({
                    to: user.email,
                    subject: "System Configuration Required - No Documents Found",
                    template: "configuration-notification",
                    context: {
                      userId: apiKey,
                      query: message,
                      timestamp: new Date().toISOString(),
                      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`
                    }
                  });

                  await sendEmail({
                    to: process.env.ADMIN_EMAIL || 'admin@qurieus.com',
                    subject: "System Configuration Required - No Documents Found",
                    template: "configuration-notification",
                    context: {
                      userId: apiKey,
                      query: message,
                      timestamp: new Date().toISOString(),
                      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard`
                    }
                  });
                }
              } catch (error) {
                console.error("Error sending configuration notification:", error);
              }
              
              data.response = "The system needs to be configured before using it.";
              responseBuffer = '';
            }
            
            controller.enqueue(new TextEncoder().encode(JSON.stringify(data) + '\n'));
          }
        } catch (e) {
          console.error('Error transforming stream:', e);
          success = false;
          errorMessage = e instanceof Error ? e.message : 'Unknown error';
          controller.enqueue(chunk);
        }
      },
      async flush(controller) {
        // Only cache if we have a response and it's not a "no documents" case
        if (responseBuffer && !responseBuffer.includes('"response":"No relevant documents found."')) {
          cacheSet(cacheKey, responseBuffer, 3600); // Cache for 1 hour
        }

        // Track analytics
        const responseTime = Date.now() - startTime;
        try {
          await prisma.queryAnalytics.create({
            data: {
              userId: apiKey,
              query: message,
              response: responseBuffer,
              responseTime,
              visitorId: effectiveVisitorId,
              success,
              error: errorMessage
            }
          });

          // Update visitor session
          await prisma.visitorSession.upsert({
            where: {
              id: effectiveVisitorId
            },
            create: {
              userId: apiKey,
              visitorId: effectiveVisitorId,
              userAgent: request.headers.get('user-agent') || 'Unknown',
              ipAddress: request.headers.get('x-forwarded-for') || 'Unknown',
              startTime: new Date(),
              endTime: new Date(),
              duration: 0,
              queries: 1
            },
            update: {
              endTime: new Date(),
              duration: {
                increment: Math.floor((Date.now() - startTime) / 1000)
              },
              queries: {
                increment: 1
              }
            }
          });
        } catch (error) {
          console.error('Error tracking analytics:', error);
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