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
  const healthUrl = process.env.BACKEND_HEALTH_URL;
  const baseUrl = (healthUrl || url)?.replace(/\/$/, "");
  if (!baseUrl) {
    return {
      name: "Backend API",
      status: "skipped",
      message: "BACKEND_URL not configured",
    };
  }
  const endpoints = healthUrl ? [baseUrl] : [`${baseUrl}/`, `${baseUrl}/api/v1/openapi.json`];
  let lastError: string | null = null;
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        lastError = "URL returned HTML (BACKEND_URL may point to frontend; set BACKEND_HEALTH_URL to FastAPI root)";
        continue;
      }
      if (!res.ok) {
        lastError = `HTTP ${res.status}: ${res.statusText}`;
        continue;
      }
      const text = await res.text();
      let data: { status?: string; message?: string };
      try {
        data = JSON.parse(text);
      } catch {
        lastError = "Response is not valid JSON";
        continue;
      }
      if (endpoint.endsWith("openapi.json")) {
        if (data && typeof data === "object") return { name: "Backend API", status: "ok", latencyMs: Date.now() - start };
      }
      if (data?.status !== "healthy") {
        lastError = data?.message || "Unhealthy response";
        continue;
      }
      return {
        name: "Backend API",
        status: "ok",
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  return {
    name: "Backend API",
    status: "error",
    message: lastError || "Unknown error",
    latencyMs: Date.now() - start,
  };
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
      signal: AbortSignal.timeout(30000),
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
  } catch (error: unknown) {
    const err = error as { name?: string; Code?: string; message?: string; $metadata?: { httpStatusCode?: number } };
    const msg = err?.message || err?.name || err?.Code || (typeof error === "object" && error !== null && "message" in error ? String((error as { message: unknown }).message) : String(error));
    return {
      name: "AWS S3 (File Storage)",
      status: "error",
      message: msg || "Check AWS credentials, bucket name, and region",
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

const SERVICE_KEYS = ["database", "paddle", "backend", "modal", "qdrant", "s3", "smtp"] as const;
const CHECK_FNS: Record<string, () => Promise<ServiceCheck>> = {
  database: checkDatabase,
  paddle: checkPaddle,
  backend: checkBackend,
  modal: checkModal,
  qdrant: checkQdrant,
  s3: checkS3,
  smtp: checkSmtp,
};

export const GET = RequireRoles([UserRole.SUPER_ADMIN, UserRole.ADMIN])(
  async (request: Request) => {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const service = searchParams.get("service");

    let checks: ServiceCheck[];
    if (service && CHECK_FNS[service]) {
      checks = [await CHECK_FNS[service]()];
    } else {
      checks = await Promise.all(SERVICE_KEYS.map((k) => CHECK_FNS[k]()));
    }

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
