import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

const ALLOWED_KEYS = ["embed_user_id"] as const;

/** SUPER_ADMIN only: set site config (e.g. default embed user id for this website). */
export const PATCH = RequireRoles([UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
  let body: { key?: string; value?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body. Send { \"key\": \"embed_user_id\", \"value\": \"<user-id>\" }" },
      { status: 400 }
    );
  }

  const key = body?.key;
  const value = body?.value;

  if (!key || !ALLOWED_KEYS.includes(key as any)) {
    return NextResponse.json(
      { error: "Invalid or missing key. Allowed: embed_user_id" },
      { status: 400 }
    );
  }

  if (value === undefined || value === null) {
    return NextResponse.json(
      { error: "Missing value for key" },
      { status: 400 }
    );
  }

  try {
    await prisma.siteConfig.upsert({
      where: { key },
      update: { value: String(value).trim() },
      create: { key, value: String(value).trim() },
    });

    return NextResponse.json({ success: true, key, value: String(value).trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error updating site config:", error);
    return NextResponse.json(
      { error: "Failed to update site config", details: message },
      { status: 500 }
    );
  }
});
