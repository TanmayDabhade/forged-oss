import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { getDataMode, isProxyEnabled } from "@/lib/dataMode";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string().optional(),
  about: z.string().max(1000).optional(),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const mode = getDataMode();

    if (await mode === "api") {
      // Forward to backend waitlist endpoint (via proxy if enabled)
      const endpoint = "/waitlist"; // your backend route
  const url = isProxyEnabled() ? `/api/proxy${endpoint}` : endpoint; // api/proxy uses NEXT_PUBLIC_API_BASE_URL
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const j = await res.json();
      if (!res.ok) return NextResponse.json(j, { status: res.status });
      return NextResponse.json({ ok: true });
    }

    // MOCK: Email forward via Resend if available, else console log
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && process.env.WAITLIST_FORWARD_TO) {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        subject: `New waitlist signup — ${data.name}`,
        to: process.env.WAITLIST_FORWARD_TO!,
        from: process.env.FROM_EMAIL || "OpenBoard <noreply@openboard.dev>",
        html: `<div><h2>Waitlist signup</h2><p><b>Name:</b> ${data.name}</p><p><b>Email:</b> ${data.email}</p><p><b>Role:</b> ${data.role ?? ""}</p><p><b>About:</b> ${data.about ?? ""}</p></div>`,
      });
    } else {
      console.log("[WAITLIST MOCK]", data);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid payload" }, { status: 400 });
  }
}
