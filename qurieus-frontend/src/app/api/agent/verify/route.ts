import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { RequireRoles } from "@/utils/roleGuardsDecorator";

// Using the new RequireRoles approach with enum values
export const GET = RequireRoles([UserRole.AGENT], "Agent Verify API")(async (request: NextRequest, user: any) => {
  return NextResponse.json({ 
      success: true, 
    agent: user?.agent 
    });
}); 