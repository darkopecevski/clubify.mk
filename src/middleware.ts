import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response } = await updateSession(request);

  // Optional: Protect routes based on auth status
  // const { user } = await updateSession(request);
  // if (!user && request.nextUrl.pathname.startsWith('/app')) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
