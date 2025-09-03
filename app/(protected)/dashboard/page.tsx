import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { datasource } from "@/lib/datasource";


export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        // middleware should redirect; this is a safe fallback
        return (
            <div className="mx-auto max-w-6xl px-4 py-12">
                <h1 className="text-3xl font-semibold">Dashboard</h1>
                <p className="mt-2 text-zinc-300">Please sign in to view your dashboard.</p>
            </div>
        );
    }


    // Profile comes from datasource (mock or api)
    const profile = await datasource.getProfile();


    return (
        <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold">Welcome{profile?.name ? `, ${profile.name}` : ''}</h1>
                    <p className="text-zinc-400 mt-1">Here’s a quick look at your OpenBoard activity.</p>
                </div>
            </div>


            <div className="mt-8 grid md:grid-cols-3 gap-6">
                <StatCard label="Roles" value={(profile?.roles || ["user"]).join(", ")} />
                <StatCard label="Posted projects" value="0" />
                <StatCard label="Expressions of interest" value="0" />
            </div>


            <div className="mt-8 grid md:grid-cols-2 gap-6">
                <Panel title="Your projects">
                    <EmptyState text="You haven’t posted any projects yet. Project posting unlocks in the next milestone." />
                </Panel>
                <Panel title="Applications">
                    <EmptyState text="No applications yet. Explore projects and express interest to get started." />
                </Panel>
            </div>
        </div>
    );
}


function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-zinc-400">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
    );
}


function Panel({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-lg font-semibold">{title}</div>
            <div className="mt-3">{children}</div>
        </div>
    );
}


function EmptyState({ text }: { text: string }) {
    return (
        <div className="text-sm text-zinc-400">{text}</div>
    );
}