export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
                <p className="text-zinc-400">Welcome back to Bo OS.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Bookings" value="12" change="+2 today" />
                <StatCard title="Active Menu Items" value="24" change="All synced" />
                <StatCard title="Vibe Check Stats" value="Spicy" change="Trending today" />
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="flex gap-4">
                    <button className="px-4 py-2 bg-red-600 rounded-lg font-medium hover:bg-red-700 transition-colors">
                        Update Daily Special
                    </button>
                    <button className="px-4 py-2 bg-zinc-800 rounded-lg font-medium hover:bg-zinc-700 transition-colors">
                        View New Reservations
                    </button>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, change }: { title: string; value: string; change: string }) {
    return (
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h3 className="text-zinc-400 text-sm font-medium mb-2">{title}</h3>
            <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{value}</span>
                <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{change}</span>
            </div>
        </div>
    )
}
