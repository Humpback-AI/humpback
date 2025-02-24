import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Auth routes handling
  if (request.nextUrl.pathname.startsWith("/auth")) {
    // Skip auth checks for the callback route and reset password route with valid code
    if (
      request.nextUrl.pathname === "/auth/callback" ||
      (request.nextUrl.pathname === "/auth/reset-password" &&
        request.nextUrl.searchParams.get("code"))
    ) {
      return response;
    }

    // If user is signed in and verified, redirect them away from auth pages
    // except for reset-password when they have a valid code
    if (session?.user.email_confirmed_at) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If user is signed in but not verified, only allow access to verification page
    if (session?.user && !session.user.email_confirmed_at) {
      if (!request.nextUrl.pathname.startsWith("/auth/verify-email")) {
        return NextResponse.redirect(
          new URL(
            `/auth/verify-email?email=${encodeURIComponent(
              session.user.email!
            )}`,
            request.url
          )
        );
      }
    }

    // Allow access to auth pages for non-authenticated users
    return response;
  }

  // Allow access to root path
  if (request.nextUrl.pathname === "/") {
    // If user is authenticated and verified, check for workspaces
    if (session?.user?.email_confirmed_at) {
      const { data: workspaceRoles } = await supabase
        .from("workspace_roles")
        .select("workspace_id")
        .eq("user_id", session.user.id)
        .limit(1);

      // If user has workspaces, redirect to the first one
      if (workspaceRoles?.length) {
        return NextResponse.redirect(
          new URL(`/${workspaceRoles[0].workspace_id}`, request.url)
        );
      }
    }
    return response;
  }

  // Allow access to workspace creation page
  if (request.nextUrl.pathname === "/workspaces/create") {
    // Redirect to login if user is not authenticated
    if (!session) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Redirect to verification page if user is not verified
    if (!session.user.email_confirmed_at) {
      return NextResponse.redirect(
        new URL(
          `/auth/verify-email?email=${encodeURIComponent(session.user.email!)}`,
          request.url
        )
      );
    }

    return response;
  }

  // Protected routes handling (everything else)
  // Redirect to login if user is not authenticated
  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Redirect to verification page if user is not verified
  if (!session.user.email_confirmed_at) {
    return NextResponse.redirect(
      new URL(
        `/auth/verify-email?email=${encodeURIComponent(session.user.email!)}`,
        request.url
      )
    );
  }

  // Check if user has any workspace roles
  const { data: workspaceRoles } = await supabase
    .from("workspace_roles")
    .select("id")
    .eq("user_id", session.user.id)
    .limit(1);

  // If user has no workspace roles, redirect to workspace creation
  if (!workspaceRoles?.length) {
    return NextResponse.redirect(new URL("/workspaces/create", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
