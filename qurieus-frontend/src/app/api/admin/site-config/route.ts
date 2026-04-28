import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";

const ALLOWED_KEYS = ["embed_user_id", "paid_renewal_reminder_days_before"] as const;
const SITE_CONFIG_DEFAULTS: Record<(typeof ALLOWED_KEYS)[number], string> = {
  embed_user_id: "",
  paid_renewal_reminder_days_before: "3",
};

/** SUPER_ADMIN only: read site config values for allowed keys. */
export const GET = RequireRoles([UserRole.SUPER_ADMIN])(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key && !ALLOWED_KEYS.includes(key as any)) {
    return NextResponse.json(
      { error: "Invalid key. Allowed: embed_user_id, paid_renewal_reminder_days_before" },
      { status: 400 }
    );
  }

  try {
    if (key) {
      const row = await prisma.siteConfig.findUnique({ where: { key } });
      return NextResponse.json({
        key,
        value: row?.value ?? SITE_CONFIG_DEFAULTS[key as keyof typeof SITE_CONFIG_DEFAULTS] ?? "",
      });
    }

    const rows = await prisma.siteConfig.findMany({
      where: { key: { in: [...ALLOWED_KEYS] } },
    });
    const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));

    return NextResponse.json({
      values: {
        embed_user_id: values.embed_user_id ?? SITE_CONFIG_DEFAULTS.embed_user_id,
        paid_renewal_reminder_days_before:
          values.paid_renewal_reminder_days_before ??
          SITE_CONFIG_DEFAULTS.paid_renewal_reminder_days_before,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to read site config", details: message },
      { status: 500 }
    );
  }
});

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
      { error: "Invalid or missing key. Allowed: embed_user_id, paid_renewal_reminder_days_before" },
      { status: 400 }
    );
  }

  if (value === undefined || value === null) {
    return NextResponse.json(
      { error: "Missing value for key" },
      { status: 400 }
    );
  }

  const normalizedValue = String(value).trim();
  if (key === "paid_renewal_reminder_days_before") {
    const parsed = Number(normalizedValue);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 30) {
      return NextResponse.json(
        { error: "paid_renewal_reminder_days_before must be an integer between 1 and 30" },
        { status: 400 }
      );
    }
  }

  try {
    await prisma.siteConfig.upsert({
      where: { key },
      update: { value: normalizedValue },
      create: { key, value: normalizedValue },
    });

    return NextResponse.json({ success: true, key, value: normalizedValue });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to update site config", details: message },
      { status: 500 }
    );
  }
});
