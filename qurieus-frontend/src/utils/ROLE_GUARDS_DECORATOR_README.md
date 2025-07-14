# Role Guards - Decorator-Based Authorization

This module provides a clean, decorator-based approach for role-based authorization in Next.js API routes. The system includes both the main `RequireRoles` function and convenient predefined decorators for common use cases.

## 🎯 **Key Features**

- **Decorator Pattern**: Clean, readable syntax for role-based access control
- **Enum-based Roles**: Uses Prisma `UserRole` enum for type safety
- **Automatic User Context**: User data automatically passed to handlers
- **Built-in Logging**: Comprehensive logging for security monitoring
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **Type Safety**: Full TypeScript support with enum validation
- **Performance**: Efficient database queries with minimal overhead

## 🚀 **Quick Start**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { RequireRoles, RequireUser, RequireAgent } from "@/utils/roleGuardsDecorator";

// Using the main RequireRoles function
export const GET = RequireRoles([UserRole.AGENT], "Agent API")(async (request: NextRequest, user: any) => {
  return NextResponse.json({ 
    success: true, 
    agent: user?.agent 
  });
});

// Using convenience decorators
export const POST = RequireUser("User API")(async (request: NextRequest, user: any) => {
  return NextResponse.json({ 
    message: "User action completed",
    userRole: user?.role 
  });
});
```

## 📝 **Available UserRole Enum Values**

```typescript
import { UserRole } from "@prisma/client";

// Available roles:
UserRole.USER        // Regular user
UserRole.AGENT       // Human agent
UserRole.ADMIN       // Administrator
UserRole.SUPER_ADMIN // Super administrator
```

## 💡 **Usage Examples**

### Using RequireRoles (Main Function)

```typescript
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

// Single role
export const GET = RequireRoles([UserRole.AGENT], "Agent Dashboard")(async (request: NextRequest, user: any) => {
  return NextResponse.json({
    agent: user.agent,
    dashboard: "Agent dashboard data"
  });
});

// Multiple roles
export const GET = RequireRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN], "Admin API")(async (request: NextRequest, user: any) => {
  return NextResponse.json({
    message: "Admin or Super Admin action completed",
    userRole: user.role
  });
});

// Any authenticated user (empty array)
export const GET = RequireRoles([], "Authenticated API")(async (request: NextRequest, user: any) => {
  return NextResponse.json({
    message: "Any authenticated user can access this",
    userRole: user.role
  });
});
```

### Using Convenience Decorators

```typescript
import { 
  RequireAuth,      // Any authenticated user
  RequireUser,      // USER role only
  RequireAgent,     // AGENT role only
  RequireAdmin,     // ADMIN role only
  RequireSuperAdmin // SUPER_ADMIN role only
} from "@/utils/roleGuardsDecorator";

// User only
export const GET = RequireUser("User Profile API")(async (request: NextRequest, user: any) => {
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Agent only
export const GET = RequireAgent("Agent API")(async (request: NextRequest, user: any) => {
  return NextResponse.json({
    agent: user.agent,
    dashboard: "Agent dashboard data"
  });
});

// Admin only
export const GET = RequireAdmin("Admin Panel")(async (request: NextRequest, user: any) => {
  return NextResponse.json({
    adminId: user.id,
    panel: "Admin panel data"
  });
});

// Super Admin only
export const GET = RequireSuperAdmin("Super Admin API")(async (request: NextRequest, user: any) => {
  return NextResponse.json({
    superAdminId: user.id,
    action: "Super admin action"
  });
});
```

### Multi-Role Convenience Decorators

```typescript
import { 
  RequireUserOrAgent,
  RequireUserOrAdmin,
  RequireAgentOrAdmin,
  RequireAdminOrSuperAdmin
} from "@/utils/roleGuardsDecorator";

// User or Agent
export const GET = RequireUserOrAgent("User/Agent Shared API")(async (request: NextRequest, user: any) => {
  return NextResponse.json({
    message: "User or Agent action completed",
    userRole: user.role
  });
});

// Admin or Super Admin
export const GET = RequireAdminOrSuperAdmin("Admin/Super Admin API")(async (request: NextRequest, user: any) => {
  return NextResponse.json({
    message: "Admin or Super Admin action completed",
    userRole: user.role
  });
});
```

### HTTP Methods (GET, POST, PUT, DELETE)

```typescript
// GET request
export const GET = RequireUser("User Profile")(async (request: NextRequest, user: any) => {
  return NextResponse.json({ user });
});

// POST with request body
export const POST = RequireUser("User Actions")(async (request: NextRequest, user: any) => {
  const body = await request.json();
  
  return NextResponse.json({
    message: "User action created",
    data: body,
    userRole: user.role
  });
});

// PUT with request body
export const PUT = RequireAgent("Agent Status Update")(async (request: NextRequest, user: any) => {
  const body = await request.json();
  
  return NextResponse.json({
    message: "Agent status updated",
    agentId: user.id,
    status: body
  });
});

// DELETE
export const DELETE = RequireAdmin("Admin Delete")(async (request: NextRequest, user: any) => {
  return NextResponse.json({
    message: "Resource deleted",
    adminId: user.id
  });
});
```

## 🔧 **Handler Function Signature**

All handlers receive two parameters:
- `request: NextRequest` - The incoming request
- `user: any` - The authenticated user object

```typescript
async (request: NextRequest, user: any) => Promise<NextResponse>
```

## 📊 **User Object Structure**

The `user` parameter contains:

```typescript
{
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  agent?: {  // Only for AGENT role
    id: string;
    displayName: string;
    isOnline: boolean;
    isAvailable: boolean;
  };
}
```

## 🚨 **Error Responses**

The guards automatically return appropriate error responses:

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "status": 401,
  "errorCode": "UNAUTHORIZED"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied - insufficient permissions",
  "status": 403,
  "errorCode": "INSUFFICIENT_PERMISSIONS"
}
```

### 500 Internal Error
```json
{
  "error": "Internal server error",
  "status": 500,
  "errorCode": "INTERNAL_ERROR"
}
```

## 📝 **Logging**

The guards automatically log:
- Authorization attempts (warn level for failures)
- Successful authorizations (info level)
- Request completion times (info level)
- Errors (error level)

Example log entries:
```
Agent API: Authorization successful { userId: "123", userRole: "AGENT", requiredRoles: ["AGENT"] }
Agent API: Request completed { userId: "123", responseTime: 45, status: 200 }
```

## 🔄 **Migration from Manual Auth**

### Before (Manual)
```typescript
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return errorResponse({ error: "Unauthorized", status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, agent: { select: { id: true } } }
    });

    if (!user || user.role !== "AGENT") {
      return errorResponse({ error: "Access denied", status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse({ error: "Internal error", status: 500 });
  }
}
```

### After (With Decorators)
```typescript
export const GET = RequireAgent("Agent API")(async (request: NextRequest, user: any) => {
  return NextResponse.json({ success: true });
});
```

## 🎯 **Best Practices**

1. **Use Enum Values**: Always use `UserRole.ROLE_NAME` instead of strings
   ```typescript
   RequireRoles([UserRole.AGENT])     // ✅ Good
   RequireRoles(['AGENT'])            // ❌ Avoid
   ```

2. **Descriptive Action Names**: Provide meaningful action names for better logging
   ```typescript
   RequireRoles([UserRole.AGENT], "Agent Status Update")  // ✅ Good
   RequireRoles([UserRole.AGENT])                         // Less descriptive
   ```

3. **Handle User Context**: The user object is automatically provided
   ```typescript
   export const GET = RequireAgent("Agent API")(async (request, user) => {
     // user is automatically available with full user data
     return NextResponse.json({ agentId: user.id });
   });
   ```

4. **Use Appropriate Role Combinations**: Choose the most specific roles for your needs
   ```typescript
   RequireRoles([UserRole.AGENT])                    // Only for agent-specific actions
   RequireRoles([UserRole.USER, UserRole.AGENT])     // For shared user/agent functionality
   ```

5. **Use Convenience Decorators**: For common role combinations, use the predefined decorators
   ```typescript
   RequireUser("User API")           // Instead of RequireRoles([UserRole.USER])
   RequireAdminOrSuperAdmin("Admin") // Instead of RequireRoles([UserRole.ADMIN, UserRole.SUPER_ADMIN])
   ```

## 🔍 **Available Decorators**

### Main Function
- `RequireRoles(roles: UserRole[], actionName?: string)` - Custom role combinations

### Single Role Convenience Decorators
- `RequireAuth(actionName?: string)` - Any authenticated user
- `RequireUser(actionName?: string)` - USER role only
- `RequireAgent(actionName?: string)` - AGENT role only
- `RequireAdmin(actionName?: string)` - ADMIN role only
- `RequireSuperAdmin(actionName?: string)` - SUPER_ADMIN role only

### Multi-Role Convenience Decorators
- `RequireUserOrAgent(actionName?: string)` - USER or AGENT role
- `RequireUserOrAdmin(actionName?: string)` - USER or ADMIN role
- `RequireAgentOrAdmin(actionName?: string)` - AGENT or ADMIN role
- `RequireAdminOrSuperAdmin(actionName?: string)` - ADMIN or SUPER_ADMIN role

### Optional Auth
- `OptionalAuth(actionName?: string)` - Allows both authenticated and unauthenticated users

## 🚀 **Performance Benefits**

- **Single Database Query**: User data fetched once per request
- **Cached Session**: Leverages NextAuth session caching
- **Minimal Overhead**: Guards add minimal performance impact
- **Optimized Logging**: Structured logging with minimal overhead

## ⚠️ **Important Notes**

1. **Routes with Params**: For routes with dynamic parameters (e.g., `[id]`), the decorator approach may not work properly. In such cases, use the function-based approach from `roleGuards.ts`.

2. **Streaming Responses**: For routes that return streaming responses, the decorator approach is fully supported.

3. **Type Safety**: All decorators are fully typed with TypeScript and provide proper type checking.

This decorator-based approach provides a clean, maintainable, and type-safe way to implement role-based authorization in your Next.js API routes! 