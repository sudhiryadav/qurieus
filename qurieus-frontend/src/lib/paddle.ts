import crypto from "crypto";

export function verifyPaddleWebhook(
  body: any,
  signature: string,
  webhookKey: string
): boolean {
  try {
    // Paddle sends the signature in the format "ts=timestamp,v1=signature"
    const [timestamp, signatureValue] = signature.split(",");
    const [, timestampValue] = timestamp.split("=");
    const [, signatureHash] = signatureValue.split("=");

    // Create the string to verify
    const stringToVerify = `${timestampValue}:${JSON.stringify(body)}`;

    // Create HMAC
    const hmac = crypto.createHmac("sha256", webhookKey);
    const digest = hmac.update(stringToVerify).digest("hex");

    // Compare the signatures
    return crypto.timingSafeEqual(
      Buffer.from(signatureHash),
      Buffer.from(digest)
    );
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
} 