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
          return new NextResponse(null, { status: 404 });
        }
      }

      // Protect user routes - only allow USER role
      if (pathname.startsWith('/user/')) {
        if (token?.role !== 'USER' && token?.role !== 'ADMIN' && token?.role !== 'AGENT' && token?.role !== 'SUPER_ADMIN') {
          // Return 404 for non-user users trying to access user pages
          return new NextResponse(null, { status: 404 });
        }
      }

      return NextResponse.next();
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