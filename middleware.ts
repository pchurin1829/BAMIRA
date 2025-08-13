import { withAuth } from "next-auth/middleware";

export default withAuth(
  () => {},
  {
    callbacks: {
      authorized: ({ token }) => {
        // Only allow users with role "admin"
        return token?.rol === "admin";
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
