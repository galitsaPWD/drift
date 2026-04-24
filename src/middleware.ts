import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
   const { pathname } = request.nextUrl;

   // 1. Admin Gate
   if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
     const session = request.cookies.get("admin_session");
     if (!session) {
       return NextResponse.redirect(new URL("/admin/login", request.url));
     }
   }

   // 2. Standard Session Logic
   return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
