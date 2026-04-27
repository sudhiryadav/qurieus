export type PaddleCustomData = Record<string, unknown>;

const DEFAULT_SOURCE_APP = "quries";

function normalize(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

export function getPaddleSourceApp(): string {
  return (
    process.env.PADDLE_SOURCE_APP ||
    process.env.NEXT_PUBLIC_PADDLE_SOURCE_APP ||
    DEFAULT_SOURCE_APP
  );
}

export function getPaddleProductTag(): string {
  return process.env.PADDLE_PRODUCT_TAG || getPaddleSourceApp();
}

export function getNormalizedPaddleProductTag(): string {
  return normalize(getPaddleProductTag());
}

export function buildPaddleCustomData(base: PaddleCustomData = {}): PaddleCustomData {
  const sourceApp = getPaddleSourceApp();
  const productTag = getPaddleProductTag();

  return {
    ...base,
    app: sourceApp,
    sourceApp,
    product: productTag,
  };
}

export function extractTagFromCustomData(customData?: PaddleCustomData | null): string {
  if (!customData) return "";
  const product = customData.product;
  const sourceApp = customData.sourceApp;
  const app = customData.app;
  return String(product || sourceApp || app || "");
}

export function isMatchingPaddleTag(customData?: PaddleCustomData | null): boolean {
  const incomingTag = normalize(extractTagFromCustomData(customData));
  const configuredTag = getNormalizedPaddleProductTag();
  return !!incomingTag && incomingTag === configuredTag;
}
