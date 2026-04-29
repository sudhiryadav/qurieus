import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    try {
      const token = req.nextauth.token;
      const pathname = req.nextUrl.pathname;

      // Protect agent routes - only allow AGENT role
      if (pathname.startsWith('/agent/')) {
        if (token?.role !== 'AGENT') {
          // Return 404 for non-agent users trying to access agent pages
          const denied = new NextResponse(null, { status: 404 });
          denied.headers.set("X-Content-Type-Options", "nosniff");
          denied.headers.set("X-Frame-Options", "DENY");
          denied.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
          return denied;
        }
      }

      // Protect user routes - only allow USER role
      if (pathname.startsWith('/user/')) {
        if (token?.role !== 'USER' && token?.role !== 'ADMIN' && token?.role !== 'AGENT' && token?.role !== 'SUPER_ADMIN') {
          // Return 404 for non-user users trying to access user pages
          const denied = new NextResponse(null, { status: 404 });
          denied.headers.set("X-Content-Type-Options", "nosniff");
          denied.headers.set("X-Frame-Options", "DENY");
          denied.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
          return denied;
        }
      }

      const response = NextResponse.next();
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "DENY");
      response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
      return response;
    } catch (error) {
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
    "/agent/:path*",
    "/user/:path*",
    /*
    "/dashboard/:path*",
    */
  ],
}; 