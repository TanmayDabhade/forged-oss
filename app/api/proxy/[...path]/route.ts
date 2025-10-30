import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/dataMode";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const base = getApiBase();
  if (!base) return NextResponse.json({ error: "API base not configured" }, { status: 500 });
  const url = `${base}/${path.join("/")}${req.nextUrl.search}`;
  const r = await fetch(url, { headers: { "Content-Type": "application/json" } });
  const text = await r.text();
  return new NextResponse(text, { status: r.status, headers: { "Content-Type": r.headers.get("content-type") || "application/json" } });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const base = getApiBase();
  if (!base) return NextResponse.json({ error: "API base not configured" }, { status: 500 });
  const url = `${base}/${path.join("/")}${req.nextUrl.search}`;
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": req.headers.get("content-type") || "application/json" }, body: await req.text() });
  const text = await r.text();
  return new NextResponse(text, { status: r.status, headers: { "Content-Type": r.headers.get("content-type") || "application/json" } });
}
