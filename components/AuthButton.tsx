"use client";
import { useSession, signIn, signOut } from "next-auth/react";


export function AuthButton() {
const { status } = useSession();
if (status === "loading") return <span className="text-zinc-400">…</span>;
if (status === "authenticated") {
return (
<button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm" onClick={() => signOut()}>
Sign out
</button>
);
}
return (
<button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-sm" onClick={() => signIn("github")}>
Sign in
</button>
);
}