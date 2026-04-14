export { default } from "next-auth/middleware";

// SEC-4: CSRF protection for mutating API routes is handled via
// getServerSession checks in each route handler. next-auth session
// cookies use SameSite=Lax by default, which prevents cross-origin
// form submissions.

export const config = {
  // WARN-4: Include sub-paths with :path*
  matcher: ["/workspace/:path*", "/profile/:path*"],
};
