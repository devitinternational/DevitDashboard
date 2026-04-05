import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Not logged in → redirect to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Logged in but not ADMIN → unauthorized
  if (role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|login|unauthorized|_next/static|_next/image|favicon.ico).*)",
  ],
};
