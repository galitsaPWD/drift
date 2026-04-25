import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_PASS = process.env.DRIFT_ADMIN_PASS || "drift2026";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === ADMIN_PASS) {
      // Set a simple session cookie for 7 days
      const cookieStore = await cookies();
      cookieStore.set("admin_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
