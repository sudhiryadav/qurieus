import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS configuration for API routes that need to be accessible from external domains
 */
export const corsConfig = {
  // Allow all origins for external API access
  allowOrigin: '*',
  // Allowed HTTP methods
  allowMethods: 'GET, POST, PUT, DELETE, OPTIONS',
  // Allowed headers including API key for authentication
  allowHeaders: 'Content-Type, x-api-key, Authorization',
  // Cache preflight requests for 24 hours
  maxAge: '86400'
};

/**
 * Helper function to add CORS headers to a NextResponse
 * @param response - The NextResponse object to add headers to
 * @param customHeaders - Optional custom headers to override defaults
 * @returns The response with CORS headers added
 */
export function addCorsHeaders(
  response: NextResponse, 
  customHeaders?: Partial<typeof corsConfig>
): NextResponse {
  const config = { ...corsConfig, ...customHeaders };
  
  response.headers.set('Access-Control-Allow-Origin', config.allowOrigin);
  response.headers.set('Access-Control-Allow-Methods', config.allowMethods);
  response.headers.set('Access-Control-Allow-Headers', config.allowHeaders);
  response.headers.set('Access-Control-Max-Age', config.maxAge);
  
  return response;
}

/**
 * Creates a CORS-enabled response with JSON data
 * @param data - The data to send in the response
 * @param status - HTTP status code (default: 200)
 * @param customHeaders - Optional custom CORS headers
 * @returns NextResponse with CORS headers and JSON data
 */
export function corsResponse(
  data: any, 
  status: number = 200, 
  customHeaders?: Partial<typeof corsConfig>
): NextResponse {
  const response = NextResponse.json(data, { status });
  return addCorsHeaders(response, customHeaders);
}

/**
 * Creates a CORS-enabled error response
 * @param error - Error message or object
 * @param status - HTTP status code (default: 500)
 * @param customHeaders - Optional custom CORS headers
 * @returns NextResponse with CORS headers and error data
 */
export function corsErrorResponse(
  error: string | { error: string; [key: string]: any }, 
  status: number = 500, 
  customHeaders?: Partial<typeof corsConfig>
): NextResponse {
  const errorData = typeof error === 'string' ? { error } : error;
  const response = NextResponse.json(errorData, { status });
  return addCorsHeaders(response, customHeaders);
}

/**
 * Higher-order function to wrap API handlers with CORS support
 * @param handler - The API handler function
 * @param customHeaders - Optional custom CORS headers
 * @returns Wrapped handler with CORS support
 */
export function withCors<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  customHeaders?: Partial<typeof corsConfig>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const response = await handler(...args);
      return addCorsHeaders(response, customHeaders);
    } catch (error) {
      return corsErrorResponse(
        'Internal server error', 
        500, 
        customHeaders
      );
    }
  };
}

/**
 * Creates an OPTIONS handler for CORS preflight requests
 * @param customHeaders - Optional custom CORS headers
 * @returns OPTIONS handler function
 */
export function createOptionsHandler(customHeaders?: Partial<typeof corsConfig>) {
  return async (request: NextRequest) => {
    const response = new NextResponse(null, { status: 200 });
    return addCorsHeaders(response, customHeaders);
  };
} 