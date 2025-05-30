import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export default withAuth(
  function middleware(req) {
    try {
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.next();
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/profile/:path*",
    /*
    "/dashboard/:path*",
    */
  ],
}; 