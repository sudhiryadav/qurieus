import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prismaDB";
import { errorResponse } from "./responser";
import { logger } from "@/lib/logger";
import { UserRole } from "@prisma/client";

// Type definitions for role guards
export type RoleGuardOptions = {
  roles?: UserRole[];
  requireAuth?: boolean;
  logAction?: boolean;
  actionName?: string;
};

export type RoleGuardFunction = (
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) => Promise<NextResponse>;

// Base role guard function
export function createRoleGuard(options: RoleGuardOptions = {}): RoleGuardFunction {
  const {
    roles = [],
    requireAuth = true,
    logAction = true,
    actionName = "API"
  } = options;

  return async (request: NextRequest, handler: (request: NextRequest) => Promise<NextResponse>) => {
    const startTime = Date.now();
    let userId: string | undefined;

    try {
      // Get session
      const session = await getServerSession(authOptions);
      
      if (!session?.user?.id) {
        if (requireAuth) {
          logger.warn(`${actionName}: Unauthorized access attempt`);
          return errorResponse({ 
            error: "Unauthorized", 
            status: 401,
            errorCode: "UNAUTHORIZED"
          });
        }
        // If auth is not required, continue without user context
        return await handler(request);
      }

      userId = session.user.id;

      // If roles are specified, check if user has required role
      if (roles.length > 0) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true }
        });

        if (!user || !roles.includes(user.role as UserRole)) {
          logger.warn(`${actionName}: Access denied - insufficient permissions`, { 
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
      }

      // Log successful authorization
      if (logAction) {
        logger.info(`${actionName}: Authorization successful`, { 
          userId, 
          userRole: session.user.role,
          requiredRoles: roles.length > 0 ? roles : "any authenticated user"
        });
      }

      // Execute the handler
      const response = await handler(request);
      
      // Log response time
      if (logAction) {
        const responseTime = Date.now() - startTime;
        logger.info(`${actionName}: Request completed`, { 
          userId, 
          responseTime,
          status: response.status 
        });
      }

      return response;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error(`${actionName}: Error in role guard`, { 
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
}

// Only keep the requireUser function that's still being used
export const requireUser = createRoleGuard({ 
  roles: [UserRole.USER],
  actionName: "User API"
});

// Helper function to get current user from session
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      is_active: true,
      is_verified: true
    }
  });

  return user;
}

// Helper function to check if user has specific role
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

// Helper function to check if user has any of the specified roles
export async function hasAnyRole(roles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  return user ? roles.includes(user.role as UserRole) : false;
}

// Helper function to get user with agent details
export async function getCurrentUserWithAgent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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
      }
    } as any
  });

  return user;
} 