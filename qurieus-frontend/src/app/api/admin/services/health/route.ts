import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { RequireRoles } from "@/utils/roleGuardsDecorator";
import { UserRole } from "@prisma/client";
import { prisma } from "@/utils/prismaDB";
import paddle from "@/lib/paddle";
import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

export type ServiceStatus = "ok" | "error" | "skipped";
export type ServiceCheck = {
  name: string;
  status: ServiceStatus;
  message?: string;
  latencyMs?: number;
};

async function checkDatabase(): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      name: "Database (PostgreSQL)",
      status: "ok",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      name: "Database (PostgreSQL)",
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      latencyMs: Date.now() - start,
    };
  }
}

async function checkPaddle(): Promise<ServiceCheck> {
  const start = Date.now();
  if (!process.env.PADDLE_API_KEY) {
    return {
      name: "Paddle (Payments)",
      status: "skipped",
      message: "PADDLE_API_KEY not configured",
    };
  }
  try {
    const products = paddle.products.list();
    let count = 0;
    for await (const _ of products) {
      count++;
      if (count >= 1) break;
    }
    return {
      name: "Paddle (Payments)",
      status: "ok",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      name: "Paddle (Payments)",
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      latencyMs: Date.now() - start,
    };
  }
}

async function checkBackend(): Promise<ServiceCheck> {
  const start = Date.now();
  const url = process.env.BACKEND_URL;
  if (!url) {
    return {
      name: "Backend API",
      status: "skipped",
      message: "BACKEND_URL not configured",
    };
  }
  try {
    const baseUrl = url.replace(/\/$/, "");
    const res = await fetch(`${baseUrl}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    if (data?.status !== "healthy") {
      throw new Error(data?.message || "Unhealthy response");
    }
    return {
      name: "Backend API",
      status: "ok",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      name: "Backend API",
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      latencyMs: Date.now() - start,
    };
  }
}

async function checkModal(): Promise<ServiceCheck> {
  const start = Date.now();
  const url = process.env.MODAL_HEALTH_CHECK_URL;
  const apiKey = process.env.MODAL_DOT_COM_X_API_KEY;
  if (!url || !apiKey) {
    return {
      name: "Modal (AI/Query)",
      status: "skipped",
      message: !url ? "MODAL_HEALTH_CHECK_URL not configured" : "MODAL_DOT_COM_X_API_KEY not configured",
    };
  }
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    if (data?.status !== "healthy") {
      throw new Error(data?.message || "Unhealthy response");
    }
    return {
      name: "Modal (AI/Query)",
      status: "ok",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      name: "Modal (AI/Query)",
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      latencyMs: Date.now() - start,
    };
  }
}

async function checkQdrant(): Promise<ServiceCheck> {
  const start = Date.now();
  const url = process.env.QDRANT_URL;
  const collection = process.env.QDRANT_COLLECTION;
  const apiKey = process.env.QDRANT_API_KEY;
  if (!url || !collection) {
    return {
      name: "Qdrant (Vector DB)",
      status: "skipped",
      message: "QDRANT_URL or QDRANT_COLLECTION not configured",
    };
  }
  try {
    const baseUrl = url.replace(/\/$/, "");
    const collectionsUrl = `${baseUrl}/collections/${collection}`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) headers["api-key"] = apiKey;

    const res = await fetch(collectionsUrl, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return {
      name: "Qdrant (Vector DB)",
      status: "ok",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      name: "Qdrant (Vector DB)",
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      latencyMs: Date.now() - start,
    };
  }
}

async function checkS3(): Promise<ServiceCheck> {
  const start = Date.now();
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  if (!bucket || !region || !accessKey || !secretKey) {
    return {
      name: "AWS S3 (File Storage)",
      status: "skipped",
      message: "AWS credentials or bucket not configured",
    };
  }
  try {
    const client = new S3Client({
      region,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    });
    await client.send(
      new HeadBucketCommand({ Bucket: bucket })
    );
    return {
      name: "AWS S3 (File Storage)",
      status: "ok",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      name: "AWS S3 (File Storage)",
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      latencyMs: Date.now() - start,
    };
  }
}

async function checkSmtp(): Promise<ServiceCheck> {
  const start = Date.now();
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USERNAME;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !port || !user || !pass) {
    return {
      name: "SMTP (Email)",
      status: "skipped",
      message: "SMTP not configured",
    };
  }
  try {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user, pass },
    });
    await transport.verify();
    return {
      name: "SMTP (Email)",
      status: "ok",
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      name: "SMTP (Email)",
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      latencyMs: Date.now() - start,
    };
  }
}

export const GET = RequireRoles([UserRole.SUPER_ADMIN, UserRole.ADMIN])(
  async () => {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const checks = await Promise.all([
      checkDatabase(),
      checkPaddle(),
      checkBackend(),
      checkModal(),
      checkQdrant(),
      checkS3(),
      checkSmtp(),
    ]);

    const summary = {
      ok: checks.filter((c) => c.status === "ok").length,
      error: checks.filter((c) => c.status === "error").length,
      skipped: checks.filter((c) => c.status === "skipped").length,
    };

    return NextResponse.json({
      services: checks,
      summary,
      checkedAt: new Date().toISOString(),
    });
  }
);
