import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Optimistic gate for /admin/*. Real authorization is re-checked in every page and server action. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (!url || !key) return isLogin ? NextResponse.next() : redirectTo("/admin/login");

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user?.app_metadata?.role === "admin";

  if (!isAdmin && !isLogin) return redirectTo("/admin/login");
  if (isAdmin && isLogin) return redirectTo("/admin/inventory");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
