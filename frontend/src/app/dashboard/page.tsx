"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { analytics, festivals, creatives, brands } from "@/lib/api";
import type { AnalyticsSummary, Festival, Creative, Brand } from "@/lib/api";

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="text-2xl mb-3">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-zinc-500">{label}</div>
    </div>
  );
}

function FestivalChip({ festival }: { festival: Festival }) {
  const daysUntil = festival.days_until ?? 0;
  const urgency =
    daysUntil <= 3 ? "border-red-500/40 text-red-400" :
    daysUntil <= 7 ? "border-[#ff6b2b]/40 text-[#ff6b2b]" :
    "border-white/10 text-zinc-400";

  return (
    <div className={`glass rounded-xl p-4 border ${urgency}`}>
      <div className="font-semibold text-sm mb-1">{festival.name}</div>
      <div className="text-xs opacity-70">
        {daysUntil === 0 ? "Today!" : daysUntil < 0 ? "Happening now" : `In ${daysUntil} days`}
      </div>
      <Link
        href={`/dashboard/creatives/new?festival=${festival.id}`}
        className="mt-3 inline-block text-xs font-semibold gradient-text hover:opacity-80"
      >
        Create → 
      </Link>
    </div>
  );
}

function CreativeRow({ creative }: { creative: Creative }) {
  const statusColor =
    creative.status === "published" ? "text-[#00c48c]" :
    creative.status === "approved" ? "text-[#4361ee]" :
    "text-zinc-500";

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <div className="text-sm font-medium capitalize">{creative.occasion_type}</div>
        <div className="text-xs text-zinc-500">
          {new Date(creative.generated_at).toLocaleDateString("en-IN", {
            day: "numeric", month: "short",
          })}
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span>{creative.downloads} ↓</span>
        <span className={`font-semibold capitalize ${statusColor}`}>{creative.status}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [upcomingFestivals, setUpcomingFestivals] = useState<Festival[]>([]);
  const [recentCreatives, setRecentCreatives] = useState<Creative[]>([]);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const brandList = await brands.list();
        const b = brandList[0] ?? null;
        setBrand(b);

        const [fests, sum] = await Promise.all([
          festivals.upcoming(14),
          b ? analytics.summary(b.id) : Promise.resolve(null),
        ]);
        setUpcomingFestivals(fests.slice(0, 4));
        setSummary(sum);

        if (b) {
          const cr = await creatives.list(b.id, 5);
          setRecentCreatives(cr);
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
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {brand && <p className="text-sm text-zinc-500 mt-1">{brand.name}</p>}
        </div>
        {brand && (
          <Link
            href="/dashboard/creatives/new"
            className="px-5 py-2.5 rounded-full gradient-saffron text-black text-sm font-bold hover:opacity-90 transition-opacity"
          >
            + New creative
          </Link>
        )}
      </div>

      {/* No brand prompt */}
      {!brand && (
        <div className="glass rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🏷️</div>
          <h2 className="text-lg font-bold mb-2">Set up your brand</h2>
          <p className="text-sm text-zinc-400 mb-5">
            Add your logo, colors and guidelines to start generating creatives.
          </p>
          <Link
            href="/dashboard/brand"
            className="inline-block px-6 py-3 rounded-full gradient-saffron text-black text-sm font-bold"
          >
            Create brand profile
          </Link>
        </div>
      )}

      {/* Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total creatives" value={summary.total_creatives} icon="🎨" />
          <StatCard label="Downloads" value={summary.total_downloads} icon="⬇️" />
          <StatCard label="Views" value={summary.total_views} icon="👁️" />
          <StatCard
            label="Top platform"
            value={summary.top_platforms[0]?.platform?.replace("-", " ") ?? "—"}
            icon="📱"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Festivals */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold">Upcoming festivals</h2>
            <Link href="/dashboard/festivals" className="text-xs text-zinc-500 hover:text-white">
              View all →
            </Link>
          </div>
          {upcomingFestivals.length === 0 ? (
            <p className="text-sm text-zinc-500">No upcoming festivals in the next 14 days.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {upcomingFestivals.map((f) => (
                <FestivalChip key={f.id} festival={f} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Creatives */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold">Recent creatives</h2>
            <Link href="/dashboard/creatives" className="text-xs text-zinc-500 hover:text-white">
              View all →
            </Link>
          </div>
          {recentCreatives.length === 0 ? (
            <p className="text-sm text-zinc-500">No creatives yet.</p>
          ) : (
            recentCreatives.map((c) => <CreativeRow key={c.id} creative={c} />)
          )}
        </div>
      </div>
    </div>
  );
}