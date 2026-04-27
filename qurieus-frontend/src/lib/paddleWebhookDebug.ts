import { getPaddleProductTag, getPaddleSourceApp } from "@/lib/paddleProduct";

type IgnoreReason = "app_tag_mismatch" | "unmapped_practice" | "missing_subscription_id";

export type PaddleWebhookDebugState = {
  sourceApp: string;
  productTag: string;
  processedCount: number;
  ignoredCount: number;
  lastEvent: string | null;
  lastTag: string | null;
  lastIgnoredReason: IgnoreReason | null;
  updatedAt: string;
};

const state: PaddleWebhookDebugState = {
  sourceApp: getPaddleSourceApp(),
  productTag: getPaddleProductTag(),
  processedCount: 0,
  ignoredCount: 0,
  lastEvent: null,
  lastTag: null,
  lastIgnoredReason: null,
  updatedAt: new Date().toISOString(),
};

function refreshConfig() {
  state.sourceApp = getPaddleSourceApp();
  state.productTag = getPaddleProductTag();
}

function bumpUpdatedAt() {
  state.updatedAt = new Date().toISOString();
}

export function markWebhookProcessed(eventType: string, tag?: string | null) {
  refreshConfig();
  state.processedCount += 1;
  state.lastEvent = eventType;
  state.lastTag = tag || null;
  state.lastIgnoredReason = null;
  bumpUpdatedAt();
}

export function markWebhookIgnored(eventType: string, reason: IgnoreReason, tag?: string | null) {
  refreshConfig();
  state.ignoredCount += 1;
  state.lastEvent = eventType;
  state.lastTag = tag || null;
  state.lastIgnoredReason = reason;
  bumpUpdatedAt();
}

export function getWebhookDebugState(): PaddleWebhookDebugState {
  refreshConfig();
  return { ...state };
}
