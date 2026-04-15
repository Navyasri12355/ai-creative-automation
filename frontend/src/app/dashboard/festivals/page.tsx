"use client";

import { useEffect, useState } from "react";
import { festivals } from "@/lib/api";
import type { Festival } from "@/lib/api";

export default function FestivalsPage() {
    const [allFestivals, setAllFestivals] = useState<Festival[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "upcoming">("all");

    useEffect(() => {
        festivals
            .list({ upcoming_only: false, days_ahead: 365 })
            .then(setAllFestivals)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const displayed =
        filter === "upcoming"
            ? allFestivals.filter(
                (f) => f.days_until !== undefined && f.days_until !== null && f.days_until >= 0
            )
            : allFestivals;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
                Loading festivals…
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Festival Calendar</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Indian festivals and occasions for your campaigns
                    </p>
                </div>
                <div className="flex gap-2">
                    {(["all", "upcoming"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${filter === f
                                    ? "gradient-saffron text-black"
                                    : "glass text-zinc-400 hover:text-white"
                                }`}
                        >
                            {f === "all" ? "All Festivals" : "Upcoming"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayed.map((festival) => (
                    <div
                        key={festival.id}
                        className="glass rounded-2xl p-5 hover:border-[#ff6b2b]/30 transition-colors group"
                    >
                        {/* Color dots */}
                        <div className="flex gap-1.5 mb-3">
                            {festival.colors.slice(0, 4).map((c, i) => (
                                <span
                                    key={i}
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>

                        <h3 className="font-bold text-base mb-1 group-hover:gradient-text transition-all">
                            {festival.name}
                        </h3>

                        {/* Translations */}
                        <div className="text-xs text-zinc-500 mb-2">
                            {Object.entries(festival.name_translations)
                                .slice(0, 3)
                                .map(([, v]) => v)
                                .join(" · ")}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                            <span className="capitalize px-2 py-0.5 rounded-md bg-white/5">
                                {festival.festival_type}
                            </span>
                            <span>
                                {new Date(festival.start_date).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                })}
                            </span>
                        </div>

                        {/* Themes */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {festival.themes.slice(0, 3).map((t) => (
                                <span
                                    key={t}
                                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#ff6b2b]/10 text-[#ff6b2b] capitalize"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>

                        {festival.days_until !== undefined && festival.days_until !== null && (
                            <div
                                className={`text-xs font-semibold ${festival.days_until <= 3
                                        ? "text-red-400"
                                        : festival.days_until <= 7
                                            ? "text-[#ff6b2b]"
                                            : "text-zinc-500"
                                    }`}
                            >
                                {festival.days_until === 0
                                    ? "🎉 Today!"
                                    : festival.days_until < 0
                                        ? "Happening now"
                                        : `In ${festival.days_until} days`}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {displayed.length === 0 && (
                <div className="glass rounded-2xl p-10 text-center">
                    <div className="text-3xl mb-3">🎊</div>
                    <p className="text-sm text-zinc-500">No festivals found for this filter.</p>
                </div>
            )}
        </div>
    );
}
