import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

interface CookieData {
  name: string;
  value: string;
  options: CookieOptions;
}

// Helper function to create redirects
const createRedirect = (request: NextRequest, path: string) => {
  return NextResponse.redirect(new URL(path, request.url));
};

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
        getAll() {
          return request.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookieList: CookieData[]) {
          cookieList.forEach(({ name, value, options }) => {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Special handling for auth routes
  if (request.nextUrl.pathname.startsWith("/auth")) {
    // Allow access to callback and reset password with code
    if (
      request.nextUrl.pathname === "/auth/callback" ||
      (request.nextUrl.pathname === "/auth/reset-password" &&
        request.nextUrl.searchParams.get("code"))
    ) {
      return response;
    }

    // Redirect verified users away from auth pages
    if (session?.user.email_confirmed_at) {
      return createRedirect(request, "/");
    }

    // Redirect unverified users to verification page
    if (session?.user && !session.user.email_confirmed_at) {
      if (!request.nextUrl.pathname.startsWith("/auth/verify-email")) {
        return createRedirect(
          request,
          `/auth/verify-email?email=${encodeURIComponent(session.user.email!)}`
        );
      }
    }

    return response;
  }

  // Authentication check for all routes
  if (!session) {
    return createRedirect(request, "/auth/signin");
  }

  // Email verification check
  if (!session.user.email_confirmed_at) {
    return createRedirect(
      request,
      `/auth/verify-email?email=${encodeURIComponent(session.user.email!)}`
    );
  }

  // Handle root path workspace redirect
  if (request.nextUrl.pathname === "/") {
    const { data: workspaceRoles } = await supabase
      .from("workspace_roles")
      .select("workspace_id")
      .eq("user_id", session.user.id)
      .limit(1);

    if (workspaceRoles?.length) {
      return createRedirect(request, `/${workspaceRoles[0].workspace_id}`);
    }
    return createRedirect(request, "/workspaces/create");
  }

  // Special handling for workspace creation
  if (request.nextUrl.pathname === "/workspaces/create") {
    return response;
  }

  // Workspace role check for all other protected routes
  const { data: workspaceRoles } = await supabase
    .from("workspace_roles")
    .select("id")
    .eq("user_id", session.user.id)
    .limit(1);

  if (!workspaceRoles?.length) {
    return createRedirect(request, "/workspaces/create");
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
