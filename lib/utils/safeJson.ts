import "server-only";
import { NextRequest, NextResponse } from "next/server";

/**
 * Safely parses a request body as JSON. Malformed/non-JSON bodies (or an
 * empty body) must produce a clean 400 response, not an uncaught exception
 * that Next.js turns into an opaque 500. Returns either the parsed value or
 * a ready-to-return NextResponse the caller should `return` immediately.
 */
export async function safeJsonBody(
  req: NextRequest
): Promise<{ data: unknown } | { errorResponse: NextResponse }> {
  try {
    const data = await req.json();
    return { data };
  } catch {
    return {
      errorResponse: NextResponse.json({ error: "Badan permintaan tidak sah" }, { status: 400 }),
    };
  }
}
