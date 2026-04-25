import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const audioUrl = searchParams.get("url");

  if (!audioUrl) {
    return NextResponse.json({ error: "Missing audio URL" }, { status: 400 });
  }

  // Get the incoming Range header from the user's browser (important for streaming)
  const rangeHeader = request.headers.get("range");

  try {
    const isDeezer = audioUrl.includes("dzcdn.net");
    
    // Minimalist fetch: Stripping fingerprint headers to bypass CDN bot-detection (403)
    const response = await fetch(audioUrl, {
      method: "GET",
      cache: "no-store", 
      referrerPolicy: "no-referrer",
      headers: {
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
        "Accept": "*/*",
        "Range": rangeHeader || "bytes=0-",
        "Accept-Language": request.headers.get("accept-language") || "en-US,en;q=0.9",
        "Connection": "keep-alive",
      }
    });

    if (!response.ok && response.status !== 206) {
       console.error(`[AudioProxy] remote status: ${response.status} for ${audioUrl.slice(0, 60)}...`);
       return NextResponse.json({ error: "CDN Blocked Access" }, { status: response.status });
    }

    // 2. Stream the body directly to the client (Partial or Full)
    const contentType = response.headers.get("Content-Type") || "audio/mpeg";
    const contentRange = response.headers.get("Content-Range");
    const contentLength = response.headers.get("Content-Length");
    
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Accept-Ranges": "bytes",
        ...(contentRange && { "Content-Range": contentRange }),
        ...(contentLength && { "Content-Length": contentLength }),
      },
    });

  } catch (error: any) {
    console.error("[AudioProxy] Proxy failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
