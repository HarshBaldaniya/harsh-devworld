import { NextResponse } from "next/server";

/** In-memory daily quota. Resets at UTC midnight. */
let usedToday = 0;
let dayStamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

function resetIfNewDay() {
  const now = new Date().toISOString().slice(0, 10);
  if (now !== dayStamp) {
    dayStamp = now;
    usedToday = 0;
  }
}

export async function GET(req: Request) {
  resetIfNewDay();

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = (searchParams.get("type") || "all").toLowerCase(); // "all" | "images" | "videos"

  const key = process.env.SERPAPI_KEY || process.env.NEXT_PUBLIC_SERPAPI_KEY;
  const limit = Number(process.env.SERPAPI_DAILY_LIMIT || "120");

  if (!key) {
    return NextResponse.json({ message: "Server is missing SERPAPI key." }, { status: 500 });
  }
  if (!q) {
    return NextResponse.json({ organic_results: [] }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
  if (usedToday >= limit) {
    // Generic message (no count)
    return NextResponse.json(
      { message: "You’ve reached today’s free search limit. Try again tomorrow." },
      { status: 429 }
    );
  }

  // Build SerpAPI URL (Google engine)
  const base = "https://serpapi.com/search.json";
  const params = new URLSearchParams({
    api_key: key,
    q,
    engine: "google",
    num: type === "images" ? "50" : (type === "videos" ? "15" : "10"),
  });

  if (type === "images") params.set("tbm", "isch"); // Google Images
  if (type === "videos") params.set("tbm", "vid");  // Google Videos

  const url = `${base}?${params.toString()}`;

  try {
    const upstream = await fetch(url, { cache: "no-store" });
    const data = await upstream.json().catch(() => ({} as Record<string, unknown>));

    // Detect plan/account errors
    const errMsg: string | undefined =
      (data && (data.error || data.error_message)) ||
      (data?.search_metadata?.status === "Error" ? (data?.search_metadata?.google_url || "Search error") : undefined);

    const planLimit =
      typeof errMsg === "string" &&
      /plan limit|account.*limit|insufficient|exceeded.*plan|disabled/i.test(errMsg);

    if (!upstream.ok || errMsg) {
      const code = planLimit ? 402 : (upstream.status >= 400 ? upstream.status : 502);
      const message = planLimit
        ? "Your SerpAPI plan limit has been reached."
        : (errMsg || `SerpAPI error (HTTP ${upstream.status})`);
      return NextResponse.json({ message }, { status: code, headers: { "Cache-Control": "no-store" } });
    }

    // Count only successful searches
    usedToday += 1;

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json({ message: "Search service unavailable." }, { status: 502 });
  }
}
