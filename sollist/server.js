// This file is not an ES module
const { createMiddlewareClient } = require("@supabase/auth-helpers-nextjs");
const { NextResponse } = require("next/server");

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  console.log("Request URL:", req.nextUrl.pathname);
  const { data: { user } } = await supabase.auth.getUser();

  if (user && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (!user && req.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/", "/dashboard"],
};
