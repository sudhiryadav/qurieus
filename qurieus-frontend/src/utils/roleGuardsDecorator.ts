/**
 * Role Guards Decorator with Redis Caching
 * 
 * This module provides role-based access control decorators for Next.js API routes
 * with Redis caching to reduce database queries for user authentication checks.
 * 
 * Features:
 * - Redis caching for user data (5-minute TTL by default)
 * - Automatic cache invalidation helpers
 * - Comprehensive logging and error handling
 * - Fallback to database queries if cache fails
 * 
 * Environment Variables:
 * - USER_CACHE_TTL: Cache TTL in seconds (default: 300)
 * - REDIS_URL: Redis connection URL (default: redis://localhost:6379)
 * 
 * Usage Examples:
 * 
 * // Basic role protection
 * export const GET = RequireUser("User API")(async (request, user) => {
 *   // user object is cached and includes role, agent details, etc.
 *   return NextResponse.json({ data: "protected" });
 * });
 * 
 * // Cache invalidation in admin routes
 * export const PATCH = RequireAdmin("Update User")(async (request, user) => {
 *   const updatedUser = await prisma.user.update({...});
 *   await invalidateUserCache(updatedUser.id); // Clear cache
 *   return NextResponse.json(updatedUser);
 * });
 * 
 * // Get current user with caching
 * const currentUser = await getCurrentUserWithAgent();
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prismaDB";
import { errorResponse } from "./responser";
import { logger } from "@/lib/logger";
import { UserRole } from "@prisma/client";
import { cacheGet, cacheSet, getRedis } from "./redis";

// Type definitions
export type RouteHandler = (request: NextRequest, user?: any) => Promise<NextResponse>;

// Cache configuration
// USER_CACHE_TTL: Time to live for user cache in seconds (default: 300 = 5 minutes)
const USER_CACHE_TTL = parseInt(process.env.USER_CACHE_TTL || "300", 10); // 5 minutes default
const USER_CACHE_PREFIX = "user:auth:";

// Helper function to generate user cache key
function generateUserCacheKey(userId: string): string {
  return `${USER_CACHE_PREFIX}${userId}`;
}

// Helper function to get user from cache or database
async function getUserWithCache(userId: string) {
  const cacheKey = generateUserCacheKey(userId);
  
  try {
    // Try to get from cache first
    const cachedUser = await cacheGet(cacheKey);
    if (cachedUser) {
      logger.info(`User cache hit for ${userId}`);
      return JSON.parse(cachedUser);
    }
    
    // Cache miss, fetch from database
    logger.info(`User cache miss for ${userId}, fetching from database`);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        is_verified: true,
        agent: {
          select: {
            id: true,
            displayName: true,
            isOnline: true,
            isAvailable: true
          }
        } as any
      }
    });
    
    if (user) {
      // Cache the user data
      await cacheSet(cacheKey, JSON.stringify(user), USER_CACHE_TTL);
      logger.info(`User cached for ${userId} with TTL ${USER_CACHE_TTL}s`);
    }
    
    return user;
  } catch (error) {
    logger.error(`Error in getUserWithCache for ${userId}:`, error);
    // Fallback to database query if cache fails
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        name: true,
        email: true,
        role: true,
        is_active: true,
        is_verified: true,
        agent: {
          select: {
            id: true,
            displayName: true,
            isOnline: true,
            isAvailable: true
          }
        } as any
      }
    });
  }
}

// Single decorator function that accepts roles array
function RequireRoles(roles: UserRole[], actionName?: string) {
  return function (handler: RouteHandler): RouteHandler {
    return async (request: NextRequest) => {
      const startTime = Date.now();
      let userId: string | undefined;
      const guardName = actionName || `API (${roles.join(', ')})`;

      try {
        // Get session
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
          logger.warn(`${guardName}: Unauthorized access attempt`);
          return errorResponse({ 
            error: "Unauthorized", 
            status: 401,
            errorCode: "UNAUTHORIZED"
          });
        }

        userId = session.user.id;

        // Get user with caching
        const user = await getUserWithCache(userId);

        if (!user || !roles.includes(user.role as UserRole)) {
          logger.warn(`${guardName}: Access denied - insufficient permissions`, { 
            userId, 
            userRole: user?.role, 
            requiredRoles: roles 
          });
          return errorResponse({ 
            error: "Access denied - insufficient permissions", 
            status: 403,
            errorCode: "INSUFFICIENT_PERMISSIONS"
          });
        }

        // Log successful authorization
        logger.info(`${guardName}: Authorization successful`, { 
          userId, 
          userRole: user.role,
          requiredRoles: roles
        });

        // Execute the handler with user context
        const response = await handler(request, user);
        
        // Log response time
        const responseTime = Date.now() - startTime;
        logger.info(`${guardName}: Request completed`, { 
          userId, 
          responseTime,
          status: response.status 
        });

        return response;

      } catch (error) {
        const responseTime = Date.now() - startTime;
        logger.error(`${guardName}: Error in role guard`, { 
          userId, 
          error: error instanceof Error ? error.message : String(error),
          responseTime,
          stack: error instanceof Error ? error.stack : undefined
        });
        
        return errorResponse({ 
          error: "Internal server error", 
          status: 500,
          errorCode: "INTERNAL_ERROR"
        });
      }
    };
  };
}

// Convenience decorators that use the main RequireRoles function
export const RequireAuth = (actionName?: string) => RequireRoles([], actionName || "Authenticated API");
export const RequireUser = (actionName?: string) => RequireRoles([UserRole.USER], actionName || "User API");
export const RequireAgent = (actionName?: string) => RequireRoles([UserRole.AGENT], actionName || "Agent API");
export const RequireAdmin = (actionName?: string) => RequireRoles([UserRole.ADMIN], actionName || "Admin API");
export const RequireSuperAdmin = (actionName?: string) => RequireRoles([UserRole.SUPER_ADMIN], actionName || "Super Admin API");

// Multi-role convenience decorators
export const RequireUserOrAgent = (actionName?: string) => RequireRoles([UserRole.USER, UserRole.AGENT], actionName || "User/Agent API");
export const RequireUserOrAdmin = (actionName?: string) => RequireRoles([UserRole.USER, UserRole.ADMIN], actionName || "User/Admin API");
export const RequireAgentOrAdmin = (actionName?: string) => RequireRoles([UserRole.AGENT, UserRole.ADMIN], actionName || "Agent/Admin API");
export const RequireAdminOrSuperAdmin = (actionName?: string) => RequireRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN], actionName || "Admin/Super Admin API");

// Export the main RequireRoles function for custom role combinations
export { RequireRoles };

// Optional auth decorator (no roles required)
export const OptionalAuth = (actionName?: string) => {
  return function (handler: RouteHandler): RouteHandler {
    return async (request: NextRequest) => {
      const startTime = Date.now();
      let userId: string | undefined;
      const guardName = actionName || "Optional Auth API";

      try {
        // Get session
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
          // No auth required, continue without user context
          const response = await handler(request);
          
          const responseTime = Date.now() - startTime;
          logger.info(`${guardName}: Anonymous request completed`, { 
            responseTime,
            status: response.status 
          });
          
          return response;
        }

        userId = session.user.id;

        // Get user data with caching
        const user = await getUserWithCache(userId);

        logger.info(`${guardName}: Authenticated request`, { 
          userId, 
          userRole: user?.role
        });

        const response = await handler(request, user);
        
        const responseTime = Date.now() - startTime;
        logger.info(`${guardName}: Request completed`, { 
          userId, 
          responseTime,
          status: response.status 
        });

        return response;

      } catch (error) {
        const responseTime = Date.now() - startTime;
        logger.error(`${guardName}: Error in optional auth guard`, { 
          userId, 
          error: error instanceof Error ? error.message : String(error),
          responseTime,
          stack: error instanceof Error ? error.stack : undefined
        });
        
        return errorResponse({ 
          error: "Internal server error", 
          status: 500,
          errorCode: "INTERNAL_ERROR"
        });
      }
    };
  };
};

// Helper function to get current user (for use inside handlers)
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const user = await getUserWithCache(session.user.id);
  
  // Return only basic user fields for backward compatibility
  if (user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      is_verified: user.is_verified
    };
  }

  return null;
}

// Helper function to get user with agent details
export async function getCurrentUserWithAgent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  // getUserWithCache already includes agent details
  return await getUserWithCache(session.user.id);
}

// Helper function to invalidate user cache (useful for admin operations)
export async function invalidateUserCache(userId: string) {
  try {
    const cacheKey = generateUserCacheKey(userId);
    const redis = getRedis();
    await redis.del(cacheKey);
    logger.info(`User cache invalidated for ${userId}`);
  } catch (error) {
    logger.error(`Error invalidating user cache for ${userId}:`, error);
  }
}

// Helper function to invalidate all user caches (use with caution)
export async function invalidateAllUserCaches() {
  try {
    const redis = getRedis();
    const keys = await redis.keys(`${USER_CACHE_PREFIX}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`Invalidated ${keys.length} user caches`);
    }
  } catch (error) {
    logger.error('Error invalidating all user caches:', error);
  }
} 