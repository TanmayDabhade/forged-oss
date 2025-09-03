import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { mode } = await req.json();
  if (mode !== "mock" && mode !== "api") {
    return NextResponse.json({ error: "invalid mode" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true, mode });
  res.cookies.set("ob_datamode", mode, { path: "/", httpOnly: false, sameSite: "lax" });
  return res;
}
