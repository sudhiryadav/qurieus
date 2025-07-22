import axiosInstance from "@/lib/axios";
import { logger } from "@/lib/logger";
import { prisma } from "@/utils/prismaDB";
import { cacheGet, cacheSet, generateQueryCacheKey } from "@/utils/redis";
import { errorResponse } from "@/utils/responser";
import { sendEscalationNotificationToUser, sendEscalationNotificationToAgents } from "@/lib/email";
import { handleUserDisconnect } from "@/lib/agentChatRecovery";
import { corsErrorResponse, createOptionsHandler } from "@/utils/cors";

// Handle OPTIONS request for CORS preflight
export const OPTIONS = createOptionsHandler();

// Rate Limiting Setup
const RATE_LIMIT = parseInt(process.env.QUERY_RATE_LIMIT || "100", 10);
const RATE_WINDOW = parseInt(process.env.QUERY_RATE_WINDOW || "60", 10); // seconds
const rateLimitStore: Record<string, { count: number; reset: number }> = {};

function checkAllowed(list: string[] | undefined, value: string) {
  if (!list || list.length === 0) return true;
  return list.some((item) => value.startsWith(item));
}

async function isRateLimited(key: string) {
  const now = Math.floor(Date.now() / 1000);
  if (!rateLimitStore[key] || rateLimitStore[key].reset < now) {
    rateLimitStore[key] = { count: 1, reset: now + RATE_WINDOW };
    return false;
  }
  if (rateLimitStore[key].count >= RATE_LIMIT) {
    return true;
  }
  rateLimitStore[key].count++;
  return false;
}

interface AnalyticsSessionArgs {
  apiKey: string;
  message: string;
  response: string;
  responseTime: number;
  visitorId: string;
  success: boolean;
  error: string | null;
  request: Request;
  startTime: number;
}

async function trackAnalytics({
  apiKey,
  message,
  response,
  responseTime,
  visitorId,
  success,
  error,
  request,
  startTime,
}: AnalyticsSessionArgs) {
  try {
    await prisma.queryAnalytics.create({
      data: {
        userId: apiKey,
        query: message,
        response: response || "",
        responseTime: responseTime || 0,
        visitorId,
        success: success ?? true,
        error: error || null,
      },
    });
    // Update visitor session
    await prisma.visitorSession.upsert({
      where: { id: visitorId },
      create: {
        userId: apiKey,
        visitorId,
        userAgent: request.headers.get("user-agent") || "Unknown",
        ipAddress: request.headers.get("x-forwarded-for") || "Unknown",
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        queries: 1,
      },
      update: {
        endTime: new Date(),
        duration: { increment: Math.floor((Date.now() - startTime) / 1000) },
        queries: { increment: 1 },
      },
    });
  } catch (err) {
    console.error("Error tracking analytics:", err);
  }
}

async function queryWithModal(message: string, userId: string, history: any[], collectionName?: string) {
  const modalUrl = process.env.MODAL_QUERY_DOCUMENTS_URL;
  const modalApiKey = process.env.MODAL_DOT_COM_X_API_KEY;
  
  if (!modalUrl) {
    console.error('❌ [QUERY API] Modal.com query URL not configured');
    throw new Error("Modal.com query URL not configured");
  }
  
  if (!modalApiKey) {
    console.error('❌ [QUERY API] Modal.com API key not configured');
    throw new Error("Modal.com API key not configured");
  }

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': modalApiKey,
  };

  // Add collection header if provided
  if (collectionName) {
    headers['x-collection'] = collectionName;
  }

  const requestBody = {
    query: message,
    user_id: userId, // Changed from document_owner_id to user_id
    history: history || [],
    collection_name: collectionName, // Also pass in body as fallback
  };

  const response = await fetch(modalUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [QUERY API] Modal.com service error:', {
      status: response.status,
      statusText: response.statusText,
      errorText
    });
    throw new Error(`Modal.com service error: ${response.status} - ${errorText}`);
  }

  return response;
}

// Configuration for escalation detection
const ESCALATION_CONFIG = {
  // Enable/disable escalation detection
  enabled: process.env.ENABLE_AGENT_ESCALATION !== 'false',
  
  // Enable/disable user intent analysis for escalation
  enableUserIntentAnalysis: process.env.ENABLE_USER_INTENT_ESCALATION !== 'false',
  
  // Minimum response length before considering escalation
  minResponseLength: parseInt(process.env.MIN_AI_RESPONSE_LENGTH || '30'),
  
  // Maximum questions allowed in AI response
  maxQuestionsInResponse: parseInt(process.env.MAX_QUESTIONS_IN_AI_RESPONSE || '2'),
  
  // Enable logging of escalation decisions
  enableLogging: process.env.ENABLE_ESCALATION_LOGGING !== 'false',
  
  // Confidence threshold for escalation (0-1)
  confidenceThreshold: parseFloat(process.env.ESCALATION_CONFIDENCE_THRESHOLD || '0.7')
};

// Helper function to detect if escalation is needed based on user intent and AI response
function shouldEscalateToAgent(aiResponse: string, userQuestion?: string): boolean {
  // If escalation is disabled, never escalate
  if (!ESCALATION_CONFIG.enabled) {
    return false;
  }
  
  const lowerResponse = aiResponse.toLowerCase();
  const lowerQuestion = userQuestion?.toLowerCase() || '';
  
  // PRIORITY 1: Check for explicit user requests for human support
  const userRequestsHumanSupport = [
    "i want to contact support",
    "i want to contact the agent",
    "i want to speak to a human",
    "i want to talk to a person",
    "i want to speak to someone",
    "i want to talk to someone",
    "i need to contact support",
    "i need to contact the agent", 
    "i need to speak to a human",
    "i need to talk to a person",
    "i need to speak to someone",
    "i need to talk to someone",
    "connect me to support",
    "connect me to an agent",
    "connect me to a human",
    "connect me to a person",
    "transfer me to support",
    "transfer me to an agent",
    "transfer me to a human",
    "transfer me to a person",
    "escalate to support",
    "escalate to agent",
    "escalate to human",
    "escalate to person",
    "hand me over to support",
    "hand me over to agent",
    "hand me over to human",
    "hand me over to person",
    "let me speak to support",
    "let me speak to agent",
    "let me speak to human",
    "let me speak to person",
    "can i speak to support",
    "can i speak to agent",
    "can i speak to human",
    "can i speak to person",
    "can i talk to support",
    "can i talk to agent",
    "can i talk to human",
    "can i talk to person",
    "i'd like to speak to support",
    "i'd like to speak to agent",
    "i'd like to speak to human",
    "i'd like to speak to person",
    "i would like to speak to support",
    "i would like to speak to agent",
    "i would like to speak to human",
    "i would like to speak to person",
    "get me support",
    "get me an agent",
    "get me a human",
    "get me a person",
    "put me through to support",
    "put me through to agent",
    "put me through to human",
    "put me through to person"
  ];
  
  // Check if user explicitly requested human support (more flexible matching)
  const hasExplicitUserRequest = ESCALATION_CONFIG.enableUserIntentAnalysis && 
    (() => {
      // Check for key intent words
      const intentWords = ['support', 'agent', 'human', 'person', 'representative', 'someone', 'team', 'staff', 'help'];
      const actionWords = ['talk', 'speak', 'contact', 'connect', 'transfer', 'escalate', 'hand', 'get', 'put', 'call', 'reach', 'find'];
      const requestWords = ['want', 'need', 'like', 'would like', 'd like', 'please', 'can you', 'could you'];
      
      // Check if user message contains intent words
      const hasIntentWord = intentWords.some(word => lowerQuestion.includes(word));
      const hasActionWord = actionWords.some(word => lowerQuestion.includes(word));
      const hasRequestWord = requestWords.some(word => lowerQuestion.includes(word));
      
      // Also check for exact phrase matches (for backward compatibility)
      const hasExactMatch = userRequestsHumanSupport.some(phrase => lowerQuestion.includes(phrase));
      
      // Escalate if we have both intent and action, or an exact match
      const shouldEscalate = hasExactMatch || (hasIntentWord && (hasActionWord || hasRequestWord));
      
      if (ESCALATION_CONFIG.enableLogging && shouldEscalate) {
        logger.info("Query API: User intent analysis", {
          userQuestion: userQuestion,
          hasIntentWord,
          hasActionWord,
          hasRequestWord,
          hasExactMatch,
          intentWordsFound: intentWords.filter(word => lowerQuestion.includes(word)),
          actionWordsFound: actionWords.filter(word => lowerQuestion.includes(word)),
          requestWordsFound: requestWords.filter(word => lowerQuestion.includes(word))
        });
      }
      
      return shouldEscalate;
    })();
  
  // If user explicitly requested human support, escalate immediately
  if (hasExplicitUserRequest) {
    if (ESCALATION_CONFIG.enableLogging) {
      logger.info("Query API: Escalation triggered by explicit user request", {
        userQuestion: userQuestion
      });
    }
    return true;
  }
  
  // 1. Check for explicit escalation indicators
  const explicitEscalationKeywords = [
    "i don't know",
    "i cannot answer",
    "i don't have information",
    "i cannot provide",
    "i'm unable to help",
    "i don't have access to",
    "i cannot help with",
    "i don't have enough information",
    "i cannot assist with",
    "i don't have the answer",
    "i cannot find",
    "i don't have details",
    "i cannot determine",
    "i don't have context",
    "i cannot respond",
    "i don't have that information",
    "i'm not able to provide",
    "i don't have access to that",
    "i cannot give you",
    "i don't have the data"
  ];
  
  // 2. Check for generic/unhelpful responses
  const genericResponsePatterns = [
    "i'm sorry, but i don't have",
    "unfortunately, i cannot",
    "i'm sorry, but i'm unable to",
    "i apologize, but i don't have",
    "i'm sorry, but i cannot provide",
    "unfortunately, i don't have access to",
    "i'm sorry, but i'm not able to",
    "i apologize, but i cannot help",
    "i'm sorry, but i don't have enough information",
    "unfortunately, i cannot assist"
  ];
  
  // 3. Check for responses that redirect to human support (this should trigger escalation)
  const redirectsToHuman = [
    "contact support",
    "contact our team",
    "reach out to our team",
    "contact customer service",
    "speak with a representative",
    "talk to our team",
    "get in touch with us",
    "contact us directly",
    "reach out to support",
    "contact our support team",
    "speak with our team",
    "talk to our support team",
    "get in touch with our team",
    "contact our customer service",
    "speak with customer service",
    "talk to customer service",
    "reach out to customer service",
    "contact our representatives",
    "speak with our representatives",
    "talk to our representatives"
  ];
  
  // 4. Check for responses that are too short and generic
  const isTooShort = aiResponse.trim().length < ESCALATION_CONFIG.minResponseLength;
  const isGeneric = genericResponsePatterns.some(pattern => lowerResponse.includes(pattern));
  
  // 5. Check for responses that don't actually answer the question
  const hasExplicitEscalation = explicitEscalationKeywords.some(keyword => lowerResponse.includes(keyword));
  const hasHumanRedirect = redirectsToHuman.some(phrase => lowerResponse.includes(phrase));
  
  // 6. Advanced checks for response quality
  const hasQuestionMarks = (aiResponse.match(/\?/g) || []).length > ESCALATION_CONFIG.maxQuestionsInResponse;
  const hasRepetitivePhrases = /(i'm sorry|unfortunately|i apologize).*?(i'm sorry|unfortunately|i apologize)/i.test(aiResponse);
  const isVeryShort = aiResponse.trim().length < 30;
  
  // 7. Check if response contains actual helpful content
  const hasHelpfulContent = (
    lowerResponse.includes("based on") ||
    lowerResponse.includes("according to") ||
    lowerResponse.includes("the document") ||
    lowerResponse.includes("your document") ||
    lowerResponse.includes("from your") ||
    lowerResponse.includes("in your") ||
    /\d+/.test(aiResponse) || // Contains numbers
    /[A-Z][a-z]+ [A-Z][a-z]+/.test(aiResponse) // Contains proper nouns
  );
  
  // Calculate escalation score (0-1)
  let escalationScore = 0;
  if (hasExplicitEscalation) escalationScore += 0.4;
  if (isGeneric) escalationScore += 0.3;
  if (hasHumanRedirect) escalationScore += 0.3;
  if (isTooShort && !hasHelpfulContent) escalationScore += 0.2;
  if (hasQuestionMarks) escalationScore += 0.2;
  if (hasRepetitivePhrases) escalationScore += 0.2;
  if (isVeryShort) escalationScore += 0.3;
  
  // Escalate if score exceeds threshold
  const shouldEscalate = escalationScore >= ESCALATION_CONFIG.confidenceThreshold;
  
  // Log escalation decision for debugging
  if (ESCALATION_CONFIG.enableLogging && shouldEscalate) {
    logger.info("Query API: Escalation triggered", {
      escalationScore,
      threshold: ESCALATION_CONFIG.confidenceThreshold,
      reason: {
        hasExplicitEscalation,
        isGeneric,
        hasHumanRedirect,
        isTooShort,
        hasQuestionMarks,
        hasRepetitivePhrases,
        isVeryShort,
        hasHelpfulContent
      },
      responseLength: aiResponse.length,
      responsePreview: aiResponse.substring(0, 100)
    });
  }
  
  return shouldEscalate;
}

// Function to find an available agent for the user
async function findAvailableAgent(userId: string): Promise<string | null> {
  try {
    // Find agents that belong to this user (parentUserId = userId) and are available
    const availableAgent = await prisma.user.findFirst({
      where: {
        parentUserId: userId,
        role: "AGENT" as any,
        is_active: true,
        agent: {
          isOnline: true,
          isAvailable: true,
          currentChats: {
            gte: 0, // Only allow non-negative currentChats
            lt: prisma.agent.fields.maxConcurrentChats
          },
          maxConcurrentChats: {
            gt: 0 // Only allow agents who can actually take chats
          }
        }
      },
      select: {
        id: true,
        agent: {
          select: {
            currentChats: true,
            maxConcurrentChats: true,
            specialties: true
          }
        }
      },
      orderBy: [
        { agent: { currentChats: 'asc' } }, // Prefer agents with fewer current chats
        { agent: { lastActiveAt: 'desc' } }  // Then prefer recently active agents
      ]
    });

    if (availableAgent) {
      logger.info("Query API: Found available agent", { 
        agentId: availableAgent.id,
        currentChats: availableAgent.agent?.currentChats,
        maxChats: availableAgent.agent?.maxConcurrentChats
      });
      return availableAgent.id;
    }

    logger.info("Query API: No available agents found", { userId });
    return null;
  } catch (error) {
    logger.error("Query API: Error finding available agent", { 
      userId,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

// Function to check if agent is active and online
async function isAgentActive(agentId: string): Promise<boolean> {
  try {
    // Check if agent is online and available
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      select: { 
        is_active: true,
        updated_at: true,
        // You might want to add lastSeen or lastActivity fields to track agent activity
      }
    });

    if (!agent || !agent.is_active) {
      logger.info("Query API: Agent marked as inactive - not active in database", { agentId });
      return false;
    }

    // Check if agent has been active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Consider agent inactive if they haven't updated their status in the last 5 minutes
    if (agent.updated_at < fiveMinutesAgo) {
      logger.info("Query API: Agent marked as inactive due to no recent activity", { 
        agentId, 
        lastActivity: agent.updated_at,
        fiveMinutesAgo 
      });
      return false;
    }

    // Additional check: Try to see if agent is connected via Socket.IO
    try {
      const io = (global as any).io;
      if (io) {
        // Get all connected sockets
        const sockets = await io.fetchSockets();
        const agentSocket = sockets.find((socket: any) => 
          socket.data && socket.data.agentId === agentId
        );
        
        if (!agentSocket) {
          logger.info("Query API: Agent marked as inactive - not connected via Socket.IO", { agentId });
          return false;
        }
      }
    } catch (socketError) {
      logger.warn("Query API: Could not check Socket.IO connection status", { 
        error: socketError instanceof Error ? socketError.message : String(socketError),
        agentId 
      });
      // If we can't check Socket.IO, fall back to timestamp check
    }
    
    logger.info("Query API: Agent is active and online", { agentId });
    return true;
  } catch (error) {
    logger.error("Query API: Error checking agent activity", { 
      error: error instanceof Error ? error.message : String(error),
      agentId 
    });
    return false;
  }
}

// Function to handle inactive agent and reassign chat
async function handleInactiveAgent(existingAgentChat: any, conversationId: string, userId: string, message: string, visitorId: string) {
  try {
    logger.info("Query API: Handling inactive agent", { 
      agentId: existingAgentChat.agentId,
      conversationId 
    });

    // Try to find another available agent
    const newAgentId = await findAvailableAgent(userId);
    
    if (newAgentId && newAgentId !== existingAgentChat.agentId) {
      // Reassign to new agent
      await prisma.agentChat.update({
        where: { id: existingAgentChat.id },
        data: {
          agentId: newAgentId,
          status: 'ACTIVE',
          assignedAt: new Date(),
          priority: 'HIGH' // Mark as high priority since it was reassigned
        }
      });

      // Send notification to new agent
      const newAgent = await prisma.user.findUnique({
        where: { id: newAgentId },
        select: { email: true, name: true }
      });

      if (newAgent?.email) {
        await sendEscalationNotificationToUser({
          userEmail: newAgent.email,
          userMessage: `Chat reassigned from inactive agent. User message: ${message}`
        });
      }

      // Add system message to inform user about reassignment
      const reassignmentMessage = "All our agents are currently unavailable. I've connected you with another agent who will assist you shortly.";
      
      await prisma.chatMessage.create({
        data: {
          conversationId,
          content: reassignmentMessage,
          role: 'system',
          createdAt: new Date(),
        },
      });

      logger.info("Query API: Chat reassigned to new agent", { 
        oldAgentId: existingAgentChat.agentId,
        newAgentId,
        conversationId 
      });

      return { reassigned: true, message: reassignmentMessage };
    } else {
      // No other agents available, escalate to support
      await prisma.agentChat.update({
        where: { id: existingAgentChat.id },
        data: {
          status: 'PENDING',
          assignedAt: new Date(),
          priority: 'URGENT'
        }
      });

      // Fetch the application owner/admin (parent user)
      const parentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true }
      });

      // Send escalation email to the application owner/admin
      if (parentUser?.email) {
        await sendEscalationNotificationToUser({
          userEmail: parentUser.email,
          userMessage: `Escalation: No agents available. Visitor message: ${message}`
        });
      }

      const escalationMessage = "All our agents are currently unavailable. I've escalated your request to our support team. You'll receive an email confirmation shortly.";

      await prisma.chatMessage.create({
        data: {
          conversationId,
          content: escalationMessage,
          role: 'system',
          createdAt: new Date(),
        },
      });

      logger.info("Query API: Chat escalated due to inactive agent", { 
        agentId: existingAgentChat.agentId,
        conversationId 
      });

      return { reassigned: false, message: escalationMessage };
    }
  } catch (error) {
    logger.error("Query API: Error handling inactive agent", { 
      error: error instanceof Error ? error.message : String(error),
      agentId: existingAgentChat.agentId,
      conversationId 
    });

    // If the error is a known agent greeting/socket error, escalate to support
    if (String(error).includes('Greeting never received')) {
      const escalationMessage = "All our agents are currently unavailable. I've escalated your request to our support team. You'll receive an email confirmation shortly.";
      await prisma.chatMessage.create({
        data: {
          conversationId,
          content: escalationMessage,
          role: 'system',
          createdAt: new Date(),
        },
      });
      return { 
        reassigned: false, 
        message: escalationMessage
      };
    }

    // Fallback message for other errors
    return { 
      reassigned: false, 
      message: "I apologize, but there seems to be a technical issue. Please try again in a moment." 
    };
  }
}

// Enhanced escalation function with agent assignment and email notifications
async function escalateChatToAgent(conversationId: string, userId: string, userMessage: string, visitorId: string) {
  try {
    logger.info("Query API: Starting escalation process", { conversationId, userId, visitorId });
    
    // Find an available agent
    const agentId = await findAvailableAgent(userId);
    let queuePosition = null;
    let hasAnyAgents = false;
    
    // Check if there are any agents at all for this user
    const totalAgents = await prisma.user.count({
      where: {
        parentUserId: userId,
        role: "AGENT" as any,
        is_active: true
      }
    });
    hasAnyAgents = totalAgents > 0;
    
    logger.info("Query API: Agent availability check", { 
      agentId, 
      hasAnyAgents, 
      totalAgents,
      conversationId 
    });
    
    if (agentId) {
      // Check if there's already an agent chat for this conversation
      const existingAgentChat = await prisma.agentChat.findUnique({
        where: { conversationId }
      });

      if (existingAgentChat) {
        // Update existing agent chat
        await prisma.agentChat.update({
          where: { conversationId },
          data: {
            agentId,
            status: 'ACTIVE',
            assignedAt: new Date(),
            priority: 'NORMAL'
          }
        });
        logger.info("Query API: Updated existing agent chat", { conversationId, agentId });
      } else {
        // Create new agent chat
        await prisma.agentChat.create({
          data: {
            conversationId,
            agentId,
            status: 'ACTIVE',
            assignedAt: new Date(),
            priority: 'NORMAL'
          }
        });
        logger.info("Query API: Created new agent chat", { conversationId, agentId });
      }

      // Send email notification to the agent
      try {
        const agent = await prisma.user.findUnique({
          where: { id: agentId },
          select: { email: true, name: true }
        });

        if (agent?.email) {
          await sendEscalationNotificationToUser({
            userEmail: agent.email,
            userMessage: userMessage
          });
          logger.info("Query API: Sent escalation notification to agent", { agentEmail: agent.email });
        }
      } catch (emailError) {
        logger.error("Query API: Failed to send agent notification email", { 
          error: emailError instanceof Error ? emailError.message : String(emailError),
          agentId 
        });
        // Don't throw error for email failures
      }

      return { agentAssigned: true, queuePosition: null, hasAnyAgents };
    } else {
      // Check if there's already an agent chat for this conversation
      const existingAgentChat = await prisma.agentChat.findUnique({
        where: { conversationId }
      });

      if (existingAgentChat) {
        // Update existing agent chat to pending status
        await prisma.agentChat.update({
          where: { conversationId },
          data: {
            status: 'PENDING',
            assignedAt: new Date(),
            priority: 'NORMAL'
          }
        });
        logger.info("Query API: Updated existing agent chat to pending", { conversationId });
      } else {
        // No available agents - update conversation status and add to queue
        await prisma.chatConversation.update({
          where: { id: conversationId },
          data: {
            status: 'ESCALATED' as any,
            escalatedAt: new Date(),
            escalationReason: hasAnyAgents ? 'No agents available' : 'No agents configured'
          } as any
        });
        logger.info("Query API: Updated conversation status to escalated", { conversationId, hasAnyAgents });
      }

      // Calculate queue position only if there are agents
      if (hasAnyAgents) {
        const pendingChats = await prisma.agentChat.count({
          where: {
            conversation: {
              userId: userId
            },
            status: 'PENDING'
          }
        });
        queuePosition = pendingChats;
        logger.info("Query API: Calculated queue position", { queuePosition, conversationId });
      }

      // Send email notification to the user about escalation
      try {
        const conversation = await prisma.chatConversation.findUnique({
          where: { id: conversationId },
          select: {
            user: { select: { email: true, name: true } },
          }
        });

        if (conversation?.user?.email) {
          await sendEscalationNotificationToUser({
            userEmail: conversation.user.email,
            userMessage: userMessage
          });
          logger.info("Query API: Sent escalation notification to user", { userEmail: conversation.user.email });
        }
      } catch (emailError) {
        logger.error("Query API: Failed to send user notification email", { 
          error: emailError instanceof Error ? emailError.message : String(emailError),
          conversationId 
        });
        // Don't throw error for email failures
      }

      logger.info("Query API: Escalation completed", { 
        agentAssigned: false, 
        queuePosition: hasAnyAgents ? queuePosition : null, 
        hasAnyAgents,
        conversationId 
      });
      
      return { agentAssigned: false, queuePosition: hasAnyAgents ? queuePosition : null, hasAnyAgents };
    }
  } catch (error) {
    logger.error("Query API: Error escalating chat to agent", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      conversationId, 
      userId, 
      visitorId 
    });
    throw error;
  }
}

export async function POST(request: Request) {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    // Extract headers for restriction checks
    const origin = request.headers.get("origin") || "";
    const referer = request.headers.get("referer") || "";
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "";
    
    const apiKey = request.headers.get("x-api-key") || "";
    const body = await request.json();
    const { message, visitorId } = body;
    
    logger.info("Query API: Processing query request", { 
      apiKey, 
      visitorId, 
      messageLength: message?.length || 0,
      origin,
      referer,
      ip 
    }, { userId });

    if (!message)
      return corsErrorResponse("Message is required", 400);
    if (!apiKey)
      return corsErrorResponse("API Key is required", 400);

    // Rate Limiting
    const rateKey = `rate:${apiKey}:${ip}`;
    if (await isRateLimited(rateKey)) {
      logger.warn("Query API: Rate limit exceeded", { apiKey, ip, rateKey }, { userId });
      return corsErrorResponse("Rate limit exceeded", 429);
    }

    // Fetch user and check domain/origin/referrer/ip restrictions
    const user = await prisma.user.findUnique({
      where: { id: apiKey },
      select: {
        id: true,
        allowedOrigins: true,
        allowedReferrers: true,
        allowedIPs: true,
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { 
            planSnapshot: true,
            plan: true // Keep for backward compatibility
          },
        },
      } as any,
    });

    // Flatten the subscriptions array to a single subscription (if any)
    const userWithSubscription = user
      ? ({ ...user, subscription: (user as any).subscriptions?.[0] || null, subscriptions: undefined } as any)
      : null;

    if (!userWithSubscription)
      return corsErrorResponse({ error: "Invalid API Key", errorCode: "INVALID_API_KEY" }, 404);
    if (!checkAllowed(userWithSubscription.allowedOrigins, origin))
      return corsErrorResponse({ error: "Origin not allowed", errorCode: "ORIGIN_NOT_ALLOWED" }, 403);
    if (!checkAllowed(userWithSubscription.allowedReferrers, referer))
      return corsErrorResponse({ error: "Referrer not allowed", errorCode: "REFERER_NOT_ALLOWED" }, 403);
    if (!checkAllowed(userWithSubscription.allowedIPs, ip))
      return corsErrorResponse({ error: "IP not allowed", errorCode: "IP_NOT_ALLOWED" }, 403);

    // Check if user has a subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: { userId: apiKey, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    if (!subscription)
      return corsErrorResponse({ error: "User has no subscription", errorCode: "NO_SUBSCRIPTION" }, 403);

    // Check if number of request is greater than the subscription plan
    const queryCount = await prisma.queryAnalytics.count({
      where: { userId: apiKey, createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 1)) } },
    });
    // Use planSnapshot if available, otherwise fall back to plan for backward compatibility
    const plan = userWithSubscription.subscription?.planSnapshot || userWithSubscription.subscription?.plan;
    if (plan?.maxQueriesPerDay && plan.maxQueriesPerDay < queryCount)
      return corsErrorResponse({ error: "Number of requests exceeded", errorCode: "QUERY_LIMIT_EXCEEDED" }, 403);

    // (DEV) Test Response
    if (process.env.NODE_ENV === "development" && false) {
      await trackAnalytics({
        apiKey,
        message,
        response: "This is a test response",
        responseTime: 0,
        visitorId: visitorId || "",
        success: true,
        error: null,
        request: request,
        startTime: Date.now(),
      });
      return new Response(
        JSON.stringify({ response: "This is a test response. You have made " + queryCount + " requests today." }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    // Query Logic
    const cacheKey = generateQueryCacheKey(message, apiKey);
    const cachedResponse = await cacheGet(cacheKey);
    // (Cache logic can be re-enabled as needed)

    // Get chat history and handle visitor ID
    let effectiveVisitorId = visitorId;
    
    // If no visitor ID provided, create a temporary one for this session
    if (!effectiveVisitorId) {
      // Generate a temporary visitor ID for this session
      effectiveVisitorId = `temp_${apiKey}_${Date.now()}`;
      
      // Create a minimal visitor info record to satisfy foreign key constraint
      await prisma.visitorInfo.upsert({
        where: { visitorId: effectiveVisitorId },
        update: {
          lastSeen: new Date(),
          totalVisits: { increment: 1 }
        },
        create: {
          visitorId: effectiveVisitorId,
          firstSeen: new Date(),
          lastSeen: new Date(),
          totalVisits: 1,
          totalQueries: 0,
          isConverted: false
        }
      });
    }
    
    const { data: historyResponse } = await axiosInstance.get(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/chat/history`,
      {
        params: {
          visitorId: effectiveVisitorId,
          userId: apiKey,
          limit: 10,
        },
      },
    );
    
    // Extract just the messages array for Modal.com API
    const history = historyResponse?.messages || [];

    // --- NEW: Store chat conversation and user message ---
    // Find or create ChatConversation
    let chatConversation = await prisma.chatConversation.findFirst({
      where: {
        visitorId: effectiveVisitorId,
        userId: apiKey,
      },
    });
    if (!chatConversation) {
      chatConversation = await prisma.chatConversation.create({
        data: {
          visitorId: effectiveVisitorId,
          userId: apiKey,
          firstSeen: new Date(),
          lastSeen: new Date(),
          totalMessages: 0,
        },
      });
    } else {
      await prisma.chatConversation.update({
        where: { id: chatConversation.id },
        data: { lastSeen: new Date() },
      });
    }
    // Store user message
    await prisma.chatMessage.create({
      data: {
        conversationId: chatConversation.id,
        content: message,
        role: 'user',
        createdAt: new Date(),
      },
    });
    // --- END NEW ---

    // --- PRIORITY: Check for existing agent chat FIRST ---
    const existingAgentChat = await prisma.agentChat.findFirst({
      where: {
        conversation: {
          visitorId: effectiveVisitorId,
          userId: apiKey
        },
        status: {
          in: ['PENDING', 'ACTIVE', 'ON_HOLD']
        }
      },
      include: {
        agent: {
          select: { name: true, email: true }
        }
      }
    });

    // If there's an active agent chat, route message to agent instead of AI
    if (existingAgentChat) {
      logger.info("Query API: Active agent chat found, routing message to agent", { 
        chatId: chatConversation.id,
        agentId: existingAgentChat.agentId,
        message: message.substring(0, 100),
        chatStatus: existingAgentChat.status
      });
      
      // Check if the assigned agent is still active
      const agentIsActive = await isAgentActive(existingAgentChat.agentId);
      
      logger.info("Query API: Agent activity check result", { 
        agentId: existingAgentChat.agentId,
        agentIsActive,
        conversationId: chatConversation.id 
      });
      
      if (!agentIsActive) {
        logger.info("Query API: Assigned agent is inactive, handling reassignment", { 
          agentId: existingAgentChat.agentId,
          conversationId: chatConversation.id 
        });
        
        // Handle inactive agent
        const inactiveAgentResult = await handleInactiveAgent(
          existingAgentChat, 
          chatConversation.id, 
          apiKey, 
          message, 
          effectiveVisitorId
        );
        
        // Store user message
        await prisma.chatMessage.create({
          data: {
            conversationId: chatConversation.id,
            content: message,
            role: 'user',
            createdAt: new Date(),
          },
        });

        // Update conversation stats
        await prisma.chatConversation.update({
          where: { id: chatConversation.id },
          data: {
            totalMessages: { increment: 2 }, // User message + system message
            lastSeen: new Date(),
          },
        });

        // Emit Socket.IO event to notify about reassignment
        try {
          const io = (global as any).io;
          if (io) {
            io.to(chatConversation.id).emit('chat_message', {
              id: `temp-${Date.now()}`,
              content: inactiveAgentResult.message,
              role: 'system',
              createdAt: new Date().toISOString(),
              conversationId: chatConversation.id
            });
          }
        } catch (socketError) {
          logger.warn("Query API: Failed to emit reassignment Socket.IO event", { 
            error: socketError instanceof Error ? socketError.message : String(socketError)
          });
        }

        // Track analytics
        const responseTime = Date.now() - startTime;
        await trackAnalytics({
          apiKey,
          message,
          response: inactiveAgentResult.message,
          responseTime,
          visitorId: effectiveVisitorId,
          success: true,
          error: null,
          request: request,
          startTime,
        });

        // Return reassignment response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            const responseData = {
              response: inactiveAgentResult.message,
              sources: [],
              done: true
            };
            
            const sseData = `data: ${JSON.stringify(responseData)}\n\n`;
            controller.enqueue(encoder.encode(sseData));
            controller.close();
          }
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "x-conversation-id": chatConversation.id,
          },
        });
      }
      
      // If agent is active, proceed with normal message routing
      logger.info("Query API: Agent is active, proceeding with normal message routing", { 
        agentId: existingAgentChat.agentId,
        conversationId: chatConversation.id 
      });
      
      // Check if user is requesting a new topic
      const lowerMessage = message.toLowerCase();
      const newTopicKeywords = ['new topic', 'start new', 'new conversation', 'fresh start', 'different topic'];
      const isRequestingNewTopic = newTopicKeywords.some(keyword => lowerMessage.includes(keyword));
      
      if (isRequestingNewTopic) {
        // Close the existing agent chat to allow a new conversation
        await prisma.agentChat.update({
          where: { id: existingAgentChat.id },
          data: { status: 'CLOSED' }
        });
        
        const newTopicMessage = "I've closed your previous conversation. You can now start a new topic. How can I help you today?";
        
        // Store the message as assistant response
        await prisma.chatMessage.create({
          data: {
            conversationId: chatConversation.id,
            content: newTopicMessage,
            role: 'assistant',
            createdAt: new Date(),
          },
        });

        // Update conversation stats
        await prisma.chatConversation.update({
          where: { id: chatConversation.id },
          data: {
            totalMessages: { increment: 2 },
            lastSeen: new Date(),
          },
        });

        // Track analytics
        const responseTime = Date.now() - startTime;
        await trackAnalytics({
          apiKey,
          message,
          response: newTopicMessage,
          responseTime,
          visitorId: effectiveVisitorId,
          success: true,
          error: null,
          request: request,
          startTime,
        });

        // Return new topic response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            const responseData = {
              response: newTopicMessage,
              sources: [],
              done: true
            };
            
            const sseData = `data: ${JSON.stringify(responseData)}\n\n`;
            controller.enqueue(encoder.encode(sseData));
            controller.close();
          }
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "x-conversation-id": chatConversation.id,
          },
        });
      }
      
      // Store user message
      await prisma.chatMessage.create({
        data: {
          conversationId: chatConversation.id,
          content: message,
          role: 'user',
          createdAt: new Date(),
        },
      });

      // Update conversation stats
      await prisma.chatConversation.update({
        where: { id: chatConversation.id },
        data: {
          totalMessages: { increment: 1 },
          lastSeen: new Date(),
        },
      });

      // Emit Socket.IO event to notify agent of new message
      try {
        const io = (global as any).io;
        if (io) {
          io.to(chatConversation.id).emit('chat_message', {
            id: `temp-${Date.now()}`,
            content: message,
            role: 'user',
            createdAt: new Date().toISOString(),
            conversationId: chatConversation.id
          });
        }
      } catch (socketError) {
        logger.warn("Query API: Failed to emit user message Socket.IO event", { 
          error: socketError instanceof Error ? socketError.message : String(socketError)
        });
      }

      // Return acknowledgment that message was sent to agent (only for first message)
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Only show system message if this is the first message after escalation
          const shouldShowSystemMessage = existingAgentChat.status === 'PENDING';
          
          if (shouldShowSystemMessage) {
            const responseData = {
              response: `Your message has been sent to ${existingAgentChat.agent?.name || 'our support team'}. They will respond shortly.`,
              sources: [],
              done: true,
              routedToAgent: true
            };
            
            const sseData = `data: ${JSON.stringify(responseData)}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          } else {
            // For subsequent messages, just acknowledge silently
            const responseData = {
              response: "",
              sources: [],
              done: true,
              routedToAgent: true
            };
            
            const sseData = `data: ${JSON.stringify(responseData)}\n\n`;
            controller.enqueue(encoder.encode(sseData));
          }
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "x-conversation-id": chatConversation.id,
        },
      });
    }

    // --- Check for user intent escalation for NEW conversations ---
    const lowerMessage = message.toLowerCase();
    const intentWords = ['support', 'agent', 'human', 'person', 'representative', 'someone', 'team', 'staff', 'help'];
    const actionWords = ['talk', 'speak', 'contact', 'connect', 'transfer', 'escalate', 'hand', 'get', 'put', 'call', 'reach', 'find'];
    const requestWords = ['want', 'need', 'like', 'would like', 'd like', 'please', 'can you', 'could you'];
    
    const hasIntentWord = intentWords.some(word => lowerMessage.includes(word));
    const hasActionWord = actionWords.some(word => lowerMessage.includes(word));
    const hasRequestWord = requestWords.some(word => lowerMessage.includes(word));
    
    // Check for exact phrase matches
    const userRequestsHumanSupport = [
      "i want to contact support", "i want to contact the agent", "i want to speak to a human",
      "i want to talk to a person", "i want to speak to someone", "i want to talk to someone",
      "i need to contact support", "i need to contact the agent", "i need to speak to a human",
      "i need to talk to a person", "i need to speak to someone", "i need to talk to someone",
      "connect me to support", "connect me to an agent", "connect me to a human", "connect me to a person",
      "transfer me to support", "transfer me to an agent", "transfer me to a human", "transfer me to a person",
      "escalate to support", "escalate to agent", "escalate to human", "escalate to person"
    ];
    
    const hasExactMatch = userRequestsHumanSupport.some(phrase => lowerMessage.includes(phrase));
    const isUserRequestingHuman = hasExactMatch || (hasIntentWord && (hasActionWord || hasRequestWord));
    
    // If user is explicitly requesting human support, escalate immediately
    if (ESCALATION_CONFIG.enableUserIntentAnalysis && isUserRequestingHuman) {
      logger.info("Query API: User intent escalation triggered", {
        userMessage: message,
        hasIntentWord,
        hasActionWord,
        hasRequestWord,
        hasExactMatch,
        intentWordsFound: intentWords.filter(word => lowerMessage.includes(word)),
        actionWordsFound: actionWords.filter(word => lowerMessage.includes(word)),
        requestWordsFound: requestWords.filter(word => lowerMessage.includes(word))
      }, { userId });

      try {
        // Check if there's a resolved/closed agent chat that we should allow to be re-escalated
        const previousResolvedChat = await prisma.agentChat.findFirst({
          where: {
            conversation: {
              visitorId: effectiveVisitorId,
              userId: apiKey
            },
            status: {
              in: ['RESOLVED', 'CLOSED']
            }
          },
          include: {
            agent: {
              select: { name: true, email: true }
            }
          }
        });

        logger.info("Query API: Previous resolved chat check", { 
          hasPreviousChat: !!previousResolvedChat,
          conversationId: chatConversation.id 
        });

        // Escalate the conversation and get agent/queue info
        const escalationResult = await escalateChatToAgent(chatConversation.id, apiKey, message, effectiveVisitorId);
        const agentsAvailable = escalationResult.agentAssigned;
        const queuePosition = escalationResult.queuePosition;
        const hasAnyAgents = escalationResult.hasAnyAgents;

        logger.info("Query API: Escalation result", { 
          agentsAvailable, 
          queuePosition, 
          hasAnyAgents,
          conversationId: chatConversation.id 
        });

        // Create escalation message based on whether this is a re-escalation
        let escalationMessage;
        if (previousResolvedChat) {
          escalationMessage = `I understand you'd like to speak with a human agent again. I've escalated your request to our support team. You'll receive an email confirmation shortly, and one of our representatives will contact you within the next few hours to assist you further.`;
        } else if (agentsAvailable) {
          escalationMessage = `I've connected you with a human agent. They'll be with you shortly.`;
        } else if (hasAnyAgents) {
          escalationMessage = `All agents are currently busy. You are in the queue (position ${(queuePosition || 0) + 1}). Please wait for the next available agent.`;
        } else {
          escalationMessage = "I understand you'd like to speak with a human agent. I've escalated your request to our support team. You'll receive an email confirmation shortly, and one of our representatives will contact you within the next few hours to assist you further.";
        }

        logger.info("Query API: Escalation message created", { escalationMessage });

        // Store escalation message as assistant response
        await prisma.chatMessage.create({
          data: {
            conversationId: chatConversation.id,
            content: escalationMessage,
            role: 'assistant',
            createdAt: new Date(),
          },
        });

        // Update conversation stats
        await prisma.chatConversation.update({
          where: { id: chatConversation.id },
          data: {
            totalMessages: { increment: 2 },
            lastSeen: new Date(),
          },
        });

        // Emit Socket.IO event for escalation
        try {
          const io = (global as any).io;
          if (io) {
            io.to(chatConversation.id).emit('chat_status', {
              status: 'escalated',
              meta: { 
                reason: 'User requested human support',
                escalatedAt: new Date(),
                isUserRequest: true
              }
            });
          }
        } catch (socketError) {
          logger.warn("Query API: Failed to emit escalation Socket.IO event", { 
            error: socketError instanceof Error ? socketError.message : String(socketError)
          });
        }

        // Track analytics
        const responseTime = Date.now() - startTime;
        await trackAnalytics({
          apiKey,
          message,
          response: escalationMessage,
          responseTime,
          visitorId: effectiveVisitorId,
          success: true,
          error: null,
          request: request,
          startTime,
        });

        // Return escalation response as streaming (embed.js expects streaming)
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            // Send the escalation message in SSE format that embed.js expects
            const responseData = {
              response: escalationMessage,
              sources: [],
              done: true,
              agentsAvailable,
              ...(agentsAvailable === false && hasAnyAgents && queuePosition !== null ? { queuePosition } : {})
            };
            // Format as SSE with data: prefix
            const sseData = `data: ${JSON.stringify(responseData)}\n\n`;
            controller.enqueue(encoder.encode(sseData));
            controller.close();
          }
        });

        const streamResponse = new Response(stream, {
          headers: {
            "Content-Type": "text/plain", // Changed to text/plain for SSE
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "x-conversation-id": chatConversation.id,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
            "Access-Control-Max-Age": "86400",
          },
        });

        logger.info("Query API: Returning escalation response", { 
          conversationId: chatConversation.id,
          responseTime: Date.now() - startTime 
        });

        return streamResponse;
      } catch (escalationError) {
        logger.error("Query API: Error during escalation process", { 
          error: escalationError instanceof Error ? escalationError.message : String(escalationError),
          stack: escalationError instanceof Error ? escalationError.stack : undefined,
          conversationId: chatConversation.id,
          apiKey,
          visitorId: effectiveVisitorId
        });

        // Return error response instead of hanging
        return corsErrorResponse("Failed to process escalation request", 500);
      }
    }

    // Query based on environment configuration
    logger.info("Query API: No active agent chat found, proceeding with AI query", { 
      apiKey,
      message: message.substring(0, 100)
    }, { userId });

    let modalResponse;
    // Query with Modal.com (Qdrant integration)
    // Use environment variable for collection name, fallback to default
    const collectionName = process.env.QDRANT_COLLECTION;
    
    modalResponse = await queryWithModal(message, apiKey, history, collectionName);

    if (!modalResponse.ok)
      throw new Error(`HTTP error! status: ${modalResponse.status}`);


    // Create a stream that processes Modal.com chunks and handles "No relevant information found"
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const processStream = async () => {
          try {
            const reader = modalResponse.body?.getReader();
            if (!reader) {
              throw new Error("No response body reader available");
            }
            
            const decoder = new TextDecoder();
            let chunkCount = 0;
            let fullResponse = "";
            let isNoDocumentsResponse = false;
            let hasProcessedNoDocuments = false;
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              
              chunkCount++;
              const chunk = decoder.decode(value);
              fullResponse += chunk;
              
              // Debug logging for first few chunks
              if (chunkCount <= 3) {
                logger.info("Query API: Processing chunk", {
                  chunkCount,
                  chunkLength: chunk.length,
                  chunkPreview: chunk.substring(0, 100),
                  fullResponseLength: fullResponse.length,
                  fullResponsePreview: fullResponse.substring(0, 200)
                });
              }
              
                          // Check if this is a "No relevant information found" response
            if (fullResponse.includes("No relevant information found") && !hasProcessedNoDocuments) {
              isNoDocumentsResponse = true;
              hasProcessedNoDocuments = true;
              
              logger.info("Query API: Detected 'No relevant information found' response, replacing with agent connection options", {
                conversationId: chatConversation.id,
                userId: apiKey,
                fullResponseLength: fullResponse.length,
                fullResponsePreview: fullResponse.substring(0, 200)
              });
              
              // Create a modified response that includes the agent connection message and buttons flag
              const modifiedResponse = {
                response: "No relevant information found.\n\nI couldn't find relevant information in your documents. Would you like to connect with a human agent who can help you with your specific question?",
                sources: [],
                done: true,
                showAgentButtons: true
              };
              
              const modifiedSSE = `data: ${JSON.stringify(modifiedResponse)}\n\n`;
              logger.info("Query API: Sending modified response with agent buttons", {
                modifiedResponse,
                sseLength: modifiedSSE.length
              });
              controller.enqueue(encoder.encode(modifiedSSE));
              
              // Skip forwarding the original response since we've replaced it
              continue;
            }
            
            // Also check for the specific SSE format that Modal.com uses
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(6); // Remove 'data: ' prefix
                  const data = JSON.parse(jsonStr);
                  
                  // Check if this is the "No relevant information found" message
                  if (data.response === "No relevant information found." && !hasProcessedNoDocuments) {
                    isNoDocumentsResponse = true;
                    hasProcessedNoDocuments = true;
                    
                    logger.info("Query API: Detected 'No relevant information found' in SSE data, replacing with agent connection options", {
                      conversationId: chatConversation.id,
                      userId: apiKey,
                      detectedData: data
                    });
                    
                    // Create a modified response that includes the agent connection message and buttons flag
                    const modifiedResponse = {
                      response: "No relevant information found.\n\nI couldn't find relevant information in your documents. Would you like to connect with a human agent who can help you with your specific question?",
                      sources: [],
                      done: true,
                      showAgentButtons: true
                    };
                    
                    const modifiedSSE = `data: ${JSON.stringify(modifiedResponse)}\n\n`;
                    logger.info("Query API: Sending modified response with agent buttons", {
                      modifiedResponse,
                      sseLength: modifiedSSE.length
                    });
                    controller.enqueue(encoder.encode(modifiedSSE));
                    
                    // Skip forwarding the original response since we've replaced it
                    continue;
                  }
                } catch (e) {
                  // Ignore JSON parsing errors for non-JSON lines
                }
              }
            }
              
              // Only forward chunks if we haven't processed a "No relevant information found" response
              if (!isNoDocumentsResponse) {
                controller.enqueue(encoder.encode(chunk));
              }
            }
            
            // If we didn't find "No relevant information found", close normally
            if (!isNoDocumentsResponse) {
              controller.close();
            } else {
              // We already sent the modified response, so close here
              controller.close();
            }
            
          } catch (error) {
            console.error('❌ [QUERY API] Error processing stream:', error);
            controller.error(error);
          }
        };
        
        processStream();
      }
    });
    
    // Return the streaming response immediately
    const finalResponse = new Response(stream, {
      headers: {
        "Content-Type": "text/plain", // Changed to text/plain for SSE
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "x-conversation-id": chatConversation.id,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-api-key, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
    return finalResponse;
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Query API: Error processing query", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    }, { userId });
    
    console.error("Query error:", error);
    return corsErrorResponse({ 
      error: "An error occurred while processing your query", 
      errorCode: "QUERY_ERROR"
    }, 500);
  }
}
