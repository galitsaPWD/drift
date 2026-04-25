import { NextResponse } from "next/server";

export async function GET() {
  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  return NextResponse.json({
    status: "ok",
    env: {
      has_client_id: !!SPOTIFY_CLIENT_ID,
      has_client_secret: !!SPOTIFY_CLIENT_SECRET,
      client_id_prefix: SPOTIFY_CLIENT_ID ? SPOTIFY_CLIENT_ID.substring(0, 4) + "..." : null,
    },
    context: "Visit this route in your browser to verify .env.local health. If has_client_id is false, restart your terminal and check the file name is exactly .env.local"
  });
}
