"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { creatives, brands, festivals as festivalsApi } from "@/lib/api";
import type { Creative, Brand, Festival } from "@/lib/api";

const PLATFORMS = [
    { value: "instagram-post", label: "Instagram Post" },
    { value: "instagram-story", label: "Instagram Story" },
    { value: "facebook-post", label: "Facebook Post" },
    { value: "linkedin-post", label: "LinkedIn Post" },
    { value: "whatsapp-business", label: "WhatsApp" },
    { value: "twitter-post", label: "Twitter/X" },
];

const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "hi", label: "Hindi" },
    { code: "te", label: "Telugu" },
    { code: "ta", label: "Tamil" },
    { code: "kn", label: "Kannada" },
    { code: "ml", label: "Malayalam" },
    { code: "bn", label: "Bengali" },
    { code: "gu", label: "Gujarati" },
    { code: "mr", label: "Marathi" },
];

export default function CreativesPage() {
    const [brand, setBrand] = useState<Brand | null>(null);
    const [allCreatives, setAllCreatives] = useState<Creative[]>([]);
    const [festivals, setFestivals] = useState<Festival[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        festival_id: "",
        occasion_type: "festival",
        platforms: ["instagram-post"],
        languages: ["en"],
        custom_message: "",
        tone: "warm",
        include_offer: "",
    });

    useEffect(() => {
        async function load() {
            try {
                const brandList = await brands.list();
                const b = brandList[0] ?? null;
                setBrand(b);

                const [fests] = await Promise.all([
                    festivalsApi.list(),
                ]);
                setFestivals(fests);

                if (b) {
                    const cr = await creatives.list(b.id);
                    setAllCreatives(cr);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    function togglePlatform(p: string) {
        setForm((f) => ({
            ...f,
            platforms: f.platforms.includes(p)
                ? f.platforms.filter((x) => x !== p)
                : [...f.platforms, p],
        }));
    }

    function toggleLang(code: string) {
        setForm((f) => ({
            ...f,
            languages: f.languages.includes(code)
                ? f.languages.filter((x) => x !== code)
                : [...f.languages, code],
        }));
    }

    async function handleGenerate(e: React.FormEvent) {
        e.preventDefault();
        if (!brand) return;
        setGenerating(true);
        setError("");
        try {
            const result = await creatives.generate({
                brand_id: brand.id,
                festival_id: form.festival_id || undefined,
                occasion_type: form.occasion_type,
                platforms: form.platforms,
                languages: form.languages,
                custom_message: form.custom_message || undefined,
                tone: form.tone,
                include_offer: form.include_offer || undefined,
            });
            setAllCreatives((prev) => [result, ...prev]);
            setShowForm(false);
        } catch (err: any) {
            setError(err.message ?? "Generation failed");
        } finally {
            setGenerating(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
                Loading creatives…
            </div>
        );
    }

    if (!brand) {
        return (
            <div className="glass rounded-2xl p-10 text-center">
                <div className="text-4xl mb-4">🏷️</div>
                <h2 className="text-lg font-bold mb-2">Create a brand first</h2>
                <p className="text-sm text-zinc-400 mb-5">
                    You need a brand profile before generating creatives.
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

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Creatives</h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Generate and manage your social media creatives
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-5 py-2.5 rounded-full gradient-saffron text-black text-sm font-bold hover:opacity-90 transition-opacity"
                >
                    {showForm ? "Cancel" : "+ New creative"}
                </button>
            </div>

            {/* Generate form */}
            {showForm && (
                <form onSubmit={handleGenerate} className="glass rounded-2xl p-6 mb-8 space-y-5">
                    {error && (
                        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                Festival / Occasion
                            </label>
                            <select
                                value={form.festival_id}
                                onChange={(e) => setForm((f) => ({ ...f, festival_id: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6b2b]/50"
                            >
                                <option value="" className="bg-zinc-900">None (general)</option>
                                {festivals.map((f) => (
                                    <option key={f.id} value={f.id} className="bg-zinc-900">
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Tone</label>
                            <select
                                value={form.tone}
                                onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6b2b]/50"
                            >
                                {["warm", "professional", "festive", "minimal"].map((t) => (
                                    <option key={t} value={t} className="bg-zinc-900 capitalize">
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Platforms */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Platforms</label>
                        <div className="flex flex-wrap gap-2">
                            {PLATFORMS.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => togglePlatform(p.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.platforms.includes(p.value)
                                            ? "bg-[#ff6b2b]/20 text-[#ff6b2b] border border-[#ff6b2b]/30"
                                            : "glass text-zinc-500 hover:text-white"
                                        }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Languages */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2">Languages</label>
                        <div className="flex flex-wrap gap-2">
                            {LANGUAGES.map((l) => (
                                <button
                                    key={l.code}
                                    type="button"
                                    onClick={() => toggleLang(l.code)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.languages.includes(l.code)
                                            ? "bg-[#4361ee]/20 text-[#4361ee] border border-[#4361ee]/30"
                                            : "glass text-zinc-500 hover:text-white"
                                        }`}
                                >
                                    {l.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom message & Offer */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                Custom Message (optional)
                            </label>
                            <input
                                type="text"
                                value={form.custom_message}
                                onChange={(e) => setForm((f) => ({ ...f, custom_message: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6b2b]/50"
                                placeholder="E.g., New collection launch"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                                Offer/CTA (optional)
                            </label>
                            <input
                                type="text"
                                value={form.include_offer}
                                onChange={(e) => setForm((f) => ({ ...f, include_offer: e.target.value }))}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6b2b]/50"
                                placeholder="E.g., 20% off"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={generating || form.platforms.length === 0}
                        className="w-full py-3 rounded-xl gradient-saffron text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {generating ? "Generating with AI… (may take 15-30s)" : "🎨 Generate Creative"}
                    </button>
                </form>
            )}

            {/* Creatives grid */}
            {allCreatives.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center">
                    <div className="text-4xl mb-4">🎨</div>
                    <h2 className="text-lg font-bold mb-2">No creatives yet</h2>
                    <p className="text-sm text-zinc-400">
                        Click &ldquo;+ New creative&rdquo; to generate your first one!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allCreatives.map((c) => (
                        <div key={c.id} className="glass rounded-2xl overflow-hidden group">
                            {/* Image preview */}
                            {c.images[0] && (
                                <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                                    <img
                                        src={c.images[0].url}
                                        alt={c.occasion_type}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            )}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold capitalize">{c.occasion_type}</span>
                                    <span
                                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${c.status === "published"
                                                ? "bg-emerald-500/15 text-emerald-400"
                                                : c.status === "approved"
                                                    ? "bg-blue-500/15 text-blue-400"
                                                    : "bg-white/5 text-zinc-500"
                                            }`}
                                    >
                                        {c.status}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
                                    {c.texts.en || Object.values(c.texts)[0] || "—"}
                                </p>
                                <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                                    <span>{c.platforms.length} platform{c.platforms.length !== 1 && "s"}</span>
                                    <span>{c.downloads} ↓</span>
                                    <span>
                                        {new Date(c.generated_at).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
