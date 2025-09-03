"use client";
import { useState } from "react";

export function WaitlistForm() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setLoading(true); setOk(null); setErr(null);
    try {
      const payload = Object.fromEntries(formData) as Record<string,string>;
      const res = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Something went wrong");
      setOk("You're on the list! We'll be in touch soon.");
    } catch (e: any) {
      setErr(e.message);
    } finally { setLoading(false); }
  }

  return (
    <form action={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <input name="name" placeholder="Your name" required className="h-12 rounded-xl bg-white/5 border border-white/10 px-4 outline-none focus:ring-2 focus:ring-brand-500" />
      <input name="email" placeholder="Email" type="email" required className="h-12 rounded-xl bg-white/5 border border-white/10 px-4 outline-none focus:ring-2 focus:ring-brand-500" />
      <select name="role" className="h-12 rounded-xl bg-white/5 border border-white/10 px-4 outline-none focus:ring-2 focus:ring-brand-500">
        <option>Contributor</option>
        <option>Maintainer</option>
        <option>Both</option>
      </select>
      <button className="h-12 rounded-xl bg-brand-500 hover:bg-brand-400 text-black font-medium shadow-soft" disabled={loading}>{loading ? "Joining…" : "Join waitlist"}</button>
      <textarea name="about" placeholder="What do you want to build? (optional)" className="md:col-span-4 h-24 rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-brand-500" />
      {ok && <p className="text-emerald-400 md:col-span-4">{ok}</p>}
      {err && <p className="text-rose-400 md:col-span-4">{err}</p>}
    </form>
  );
}
