import { type NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    "";

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          for (const cookie of cookies) {
            request.cookies.set(cookie);
          }
          for (const cookie of cookies) {
            response.cookies.set(cookie);
          }
        },
      },
    },
  );

  // Refresh session if expired (required for Server Components)
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
      Match all request paths except for:
      - _next/static (static files)
      - _next/image (image optimization files)
      - favicon.ico (favicon file)
    */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

