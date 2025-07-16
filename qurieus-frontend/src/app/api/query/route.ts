import axiosInstance from "@/lib/axios";
import { logger } from "@/lib/logger";
import { prisma } from "@/utils/prismaDB";
import { cacheGet, cacheSet, generateQueryCacheKey } from "@/utils/redis";
import { errorResponse } from "@/utils/responser";
import { sendEscalationNotificationToUser, sendEscalationNotificationToAgents } from "@/lib/email";


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
            lt: prisma.agent.fields.maxConcurrentChats
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

// Enhanced escalation function with agent assignment and email notifications
async function escalateChatToAgent(conversationId: string, userId: string, userMessage: string, visitorId: string) {
  try {
    // Find an available agent
    const agentId = await findAvailableAgent(userId);
    
    if (agentId) {
      // Create AgentChat record to assign the chat to the agent
      await prisma.agentChat.create({
        data: {
          conversationId: conversationId,
          agentId: agentId,
          status: "PENDING" as any,
          priority: "NORMAL" as any,
          assignedAt: new Date()
        }
      });

      // Update agent's current chat count
      await prisma.agent.update({
        where: { userId: agentId },
        data: {
          currentChats: { increment: 1 }
        }
      });

      // Update conversation status to indicate escalation
      await prisma.chatConversation.update({
        where: { id: conversationId },
        data: {
          status: "ESCALATED" as any,
          escalatedAt: new Date(),
          escalationReason: "AI unable to provide satisfactory answer"
        } as any
      });

      logger.info("Query API: Chat escalated and assigned to agent", { 
        conversationId,
        userId,
        agentId
      });
    } else {
      // No available agents - mark as escalated without assignment and send email notifications
      const escalatedAt = new Date();
      const escalationReason = "AI unable to provide satisfactory answer - No agents available";
      
      await prisma.chatConversation.update({
        where: { id: conversationId },
        data: {
          status: "ESCALATED" as any,
          escalatedAt,
          escalationReason
        } as any
      });

      logger.warn("Query API: Chat escalated but no agents available", { 
        conversationId,
        userId
      });

      // Send email notifications
      try {
        // Get user email
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true }
        });

        // Get all agents for this user
        const agents = await prisma.user.findMany({
          where: {
            parentUserId: userId,
            role: "AGENT" as any,
            is_active: true
          },
          select: { email: true }
        });

        const agentEmails = agents.map(agent => agent.email).filter(Boolean);

        // Send email to user
        if (user?.email) {
          await sendEscalationNotificationToUser({
            userEmail: user.email,
            userMessage
          });
          logger.info("Query API: Escalation notification sent to user", { 
            userEmail: user.email,
            conversationId
          });
        }

        // Send email to agents
        if (agentEmails.length > 0) {
          await sendEscalationNotificationToAgents({
            agentEmails,
            userId,
            visitorId,
            conversationId,
            userMessage,
            escalationReason,
            escalatedAt: escalatedAt.toISOString()
          });
          logger.info("Query API: Escalation notifications sent to agents", { 
            agentEmails,
            conversationId
          });
        }
      } catch (emailError) {
        logger.error("Query API: Error sending escalation emails", { 
          conversationId,
          userId,
          error: emailError instanceof Error ? emailError.message : String(emailError)
        });
      }
    }
  } catch (error) {
    logger.error("Query API: Error escalating chat", { 
      conversationId,
      userId,
      error: error instanceof Error ? error.message : String(error)
    });
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
      return errorResponse({ error: "Message is required", status: 400 });
    if (!apiKey)
      return errorResponse({ error: "API Key is required", status: 400 });

    // Rate Limiting
    const rateKey = `rate:${apiKey}:${ip}`;
    if (await isRateLimited(rateKey)) {
      logger.warn("Query API: Rate limit exceeded", { apiKey, ip, rateKey }, { userId });
      return errorResponse({ error: "Rate limit exceeded", status: 429 });
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
          select: { plan: true },
        },
      } as any,
    });

    // Flatten the subscriptions array to a single subscription (if any)
    const userWithSubscription = user
      ? ({ ...user, subscription: (user as any).subscriptions?.[0] || null, subscriptions: undefined } as any)
      : null;

    if (!userWithSubscription)
      return errorResponse({ error: "Invalid API Key", status: 404, errorCode: "INVALID_API_KEY" });
    if (!checkAllowed(userWithSubscription.allowedOrigins, origin))
      return errorResponse({ error: "Origin not allowed", status: 403, errorCode: "ORIGIN_NOT_ALLOWED" });
    if (!checkAllowed(userWithSubscription.allowedReferrers, referer))
      return errorResponse({ error: "Referrer not allowed", status: 403, errorCode: "REFERER_NOT_ALLOWED" });
    if (!checkAllowed(userWithSubscription.allowedIPs, ip))
      return errorResponse({ error: "IP not allowed", status: 403, errorCode: "IP_NOT_ALLOWED" });

    // Check if user has a subscription
    const subscription = await prisma.userSubscription.findFirst({
      where: { userId: apiKey, status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
    if (!subscription)
      return errorResponse({ error: "User has no subscription", status: 403, errorCode: "NO_SUBSCRIPTION" });

    // Check if number of request is greater than the subscription plan
    const queryCount = await prisma.queryAnalytics.count({
      where: { userId: apiKey, createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 1)) } },
    });
    if (userWithSubscription.subscription?.plan.maxQueriesPerDay && userWithSubscription.subscription.plan.maxQueriesPerDay < queryCount)
      return errorResponse({ error: "Number of requests exceeded", status: 403, errorCode: "QUERY_LIMIT_EXCEEDED" });

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

    // --- PRIORITY: Check for user intent escalation BEFORE making API call ---
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

      // Escalate the conversation
      await escalateChatToAgent(chatConversation.id, apiKey, message, effectiveVisitorId);

      // Create escalation message
      const escalationMessage = "I understand you'd like to speak with a human agent. I've escalated your request to our support team. You'll receive an email confirmation shortly, and one of our representatives will contact you within the next few hours to assist you further.";
      
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
            done: true
          };
          
          // Format as SSE with data: prefix
          const sseData = `data: ${JSON.stringify(responseData)}\n\n`;
          controller.enqueue(encoder.encode(sseData));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain", // Changed to text/plain for SSE
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Query based on environment configuration
    logger.info("Query API: Executing query", { 
      apiKey
    }, { userId });

    let response;
    // Query with Modal.com (Qdrant integration)
    // Use environment variable for collection name, fallback to default
    const collectionName = process.env.QDRANT_COLLECTION;
    
    response = await queryWithModal(message, apiKey, history, collectionName);

    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);


    // Create a stream that forwards Modal.com chunks directly
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const forwardStream = async () => {
          try {
            const reader = response.body?.getReader();
            if (!reader) {
              throw new Error("No response body reader available");
            }
            
            const decoder = new TextDecoder();
            let chunkCount = 0;
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              
              chunkCount++;
              const chunk = decoder.decode(value);
              
              // Forward the chunk directly to frontend
              controller.enqueue(encoder.encode(chunk));
            }
            
            controller.close();
            
          } catch (error) {
            console.error('❌ [QUERY API] Error forwarding stream:', error);
            controller.error(error);
          }
        };
        
        forwardStream();
      }
    });
    
    // Return the streaming response immediately
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain", // Changed to text/plain for SSE
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Query API: Error processing query", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    }, { userId });
    
    console.error("Query error:", error);
    return errorResponse({ 
      error: "An error occurred while processing your query", 
      status: 500,
      errorCode: "QUERY_ERROR"
    });
  }
}
