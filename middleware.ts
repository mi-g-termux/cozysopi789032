import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight edge guard. Deep role checks happen in the admin layout and
// in each /api/admin route (double auth check: middleware + route handler).
const PUBLIC_TOP = new Set([
  "", "shop", "cart", "checkout", "login", "register", "verify-email",
  "forgot-password", "reset-password", "account", "order-success", "api", "_next",
  "favicon.ico", "placeholder.png"
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /api/admin/* at the edge (presence of session cookie).
  if (pathname.startsWith("/api/admin")) {
    const hasSession =
      req.cookies.has("authjs.session-token") ||
      req.cookies.has("__Secure-authjs.session-token");
    if (!hasSession) {
      return NextResponse.json(
        { success: false, error: "Not authenticated", code: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"]
};
