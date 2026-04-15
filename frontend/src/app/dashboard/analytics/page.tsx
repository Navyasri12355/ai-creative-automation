"use client";

import { useEffect, useState } from "react";
import { analytics, brands } from "@/lib/api";
import type { AnalyticsSummary, Brand } from "@/lib/api";
import Link from "next/link";

function StatCard({
    label,
    value,
    icon,
    accent,
}: {
    label: string;
    value: number | string;
    icon: string;
    accent?: string;
}) {
    return (
        <div className="glass rounded-2xl p-6 hover:border-[#ff6b2b]/20 transition-colors">
            <div className="text-2xl mb-3">{icon}</div>
            <div className={`text-3xl font-bold mb-1 ${accent || ""}`}>{value}</div>
            <div className="text-sm text-zinc-500">{label}</div>
        </div>
    );
}

export default function AnalyticsPage() {
    const [brand, setBrand] = useState<Brand | null>(null);
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const brandList = await brands.list();
                const b = brandList[0] ?? null;
                setBrand(b);
                if (b) {
                    const s = await analytics.summary(b.id);
                    setSummary(s);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
                Loading analytics…
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="glass rounded-2xl p-10 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h2 className="text-lg font-bold mb-2">No brand set up</h2>
                <p className="text-sm text-zinc-400 mb-5">
                    Create a brand to start tracking analytics.
                </p>
                <Link
                    href="/dashboard/brand"
                    className="inline-block px-6 py-3 rounded-full gradient-saffron text-black text-sm font-bold"
                >
                    Create brand
                </Link>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="glass rounded-2xl p-10 text-center">
                <div className="text-4xl mb-4">📈</div>
                <h2 className="text-lg font-bold mb-2">No data yet</h2>
                <p className="text-sm text-zinc-400">
                    Generate some creatives to see analytics here.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-sm text-zinc-500 mt-1">{brand.name} — performance overview</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total creatives" value={summary.total_creatives} icon="🎨" />
                <StatCard label="Downloads" value={summary.total_downloads} icon="⬇️" accent="gradient-text" />
                <StatCard label="Views" value={summary.total_views} icon="👁️" />
                <StatCard
                    label="Top platform"
                    value={summary.top_platforms[0]?.platform?.replace("-", " ") ?? "—"}
                    icon="📱"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top platforms */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="font-bold mb-5">Platform Distribution</h2>
                    {summary.top_platforms.length === 0 ? (
                        <p className="text-sm text-zinc-500">No data yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {summary.top_platforms.map((p) => {
                                const max = summary.top_platforms[0]?.count || 1;
                                const pct = Math.round((p.count / max) * 100);
                                return (
                                    <div key={p.platform}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="capitalize text-zinc-300">
                                                {p.platform.replace("-", " ")}
                                            </span>
                                            <span className="text-zinc-500">{p.count}</span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full gradient-saffron transition-all duration-500"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent creatives */}
                <div className="glass rounded-2xl p-6">
                    <h2 className="font-bold mb-5">Recent Activity</h2>
                    {summary.recent_creatives.length === 0 ? (
                        <p className="text-sm text-zinc-500">No activity yet.</p>
                    ) : (
                        <div className="space-y-0">
                            {summary.recent_creatives.map((c) => (
                                <div
                                    key={c.id}
                                    className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                                >
                                    <div>
                                        <div className="text-sm font-medium capitalize">{c.occasion_type}</div>
                                        <div className="text-xs text-zinc-500">
                                            {new Date(c.generated_at).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                                        <span>{c.downloads} ↓</span>
                                        <span
                                            className={`font-semibold capitalize ${c.status === "published"
                                                    ? "text-[#00c48c]"
                                                    : c.status === "approved"
                                                        ? "text-[#4361ee]"
                                                        : "text-zinc-500"
                                                }`}
                                        >
                                            {c.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
