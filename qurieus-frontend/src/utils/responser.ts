import { NextResponse } from "next/server";

interface ErrorResponseOptions {
  error: string | Record<string, any>; // allow object or string
  errorCode?: string;
  details?: any;
  status?: number;
}

export function errorResponse({ error, errorCode, details, status = 400 }: ErrorResponseOptions) {
  return NextResponse.json({ error, status, errorCode, details }, { status });
}