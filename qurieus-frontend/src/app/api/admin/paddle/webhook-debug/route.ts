import { NextResponse } from "next/server";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";
import { getWebhookDebugState } from "@/lib/paddleWebhookDebug";

export const GET = RequireRoles([UserRole.SUPER_ADMIN])(async () => {
  return NextResponse.json(getWebhookDebugState());
});
