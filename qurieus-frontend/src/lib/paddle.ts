import crypto from "crypto";

export function verifyPaddleWebhook(
  body: any,
  signature: string,
  webhookKey: string
): boolean {
  try {
    const hmac = crypto.createHmac("sha256", webhookKey);
    const digest = hmac.update(JSON.stringify(body)).digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
} 