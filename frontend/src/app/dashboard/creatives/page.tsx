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
    const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);
    const [editingTexts, setEditingTexts] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

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

    async function handleSaveTexts() {
        if (!selectedCreative) return;
        setSaving(true);
        try {
            const updated = await creatives.update(selectedCreative.id, { texts: editingTexts });
            setAllCreatives((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setSelectedCreative(null);
            setEditingTexts({});
        } catch (err: any) {
            alert(err.message ?? "Failed to save edits");
        } finally {
            setSaving(false);
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
                        <div 
                            key={c.id} 
                            className="glass rounded-2xl overflow-hidden group cursor-pointer hover:border-[#ff6b2b]/30 border border-transparent transition-colors"
                            onClick={() => {
                                setSelectedCreative(c);
                                setEditingTexts(c.texts);
                            }}
                        >
                            {/* Image preview */}
                            {c.images[0] && (
                                <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                                    <img
                                        src={c.images[0].url}
                                        alt={c.occasion_type}
                                        loading="lazy"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            if (target.parentElement) {
                                                target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-600/30 to-purple-600/30"><span class="text-5xl">🎨</span></div>';
                                            }
                                        }}
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

            {/* View/Edit Modal */}
            {selectedCreative && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
                        {/* Image Side */}
                        <div className="w-full md:w-1/2 bg-zinc-950 flex flex-col items-center justify-center p-6 relative">
                            {selectedCreative.images[0] ? (
                                <img
                                    src={selectedCreative.images[0].url}
                                    alt="Creative"
                                    className="max-w-full max-h-[40vh] md:max-h-[70vh] object-contain rounded-xl shadow-2xl"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        if (target.parentElement) {
                                            target.parentElement.innerHTML = '<div class="w-full aspect-square flex items-center justify-center bg-gradient-to-br from-orange-600/30 to-purple-600/30 rounded-xl"><span class="text-6xl">🎨</span><p class="mt-4 text-zinc-400 font-medium">Image unavailable</p></div>';
                                        }
                                    }}
                                />
                            ) : (
                                <div className="w-full aspect-square flex items-center justify-center bg-zinc-900 rounded-xl">
                                    <span className="text-4xl text-zinc-600">No Image</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 flex gap-2">
                                {selectedCreative.platforms.map((p) => (
                                    <span key={p} className="bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white">
                                        {p.replace("-", " ")}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Details & Edit Side */}
                        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col h-full bg-zinc-900/50">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold capitalize mb-1">{selectedCreative.occasion_type} Post</h3>
                                    <p className="text-xs text-zinc-400">
                                        Generated on {new Date(selectedCreative.generated_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setSelectedCreative(null)}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                                <div>
                                    <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                                        <span className="text-xl">📝</span> Captions
                                    </h4>
                                    <div className="space-y-4">
                                        {Object.entries(editingTexts).map(([lang, text]) => (
                                            <div key={lang} className="glass rounded-xl p-4 border border-white/5">
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                                                    {lang === "en" ? "English" : lang === "hi" ? "Hindi" : lang}
                                                </label>
                                                <textarea
                                                    value={text}
                                                    onChange={(e) => setEditingTexts(prev => ({ ...prev, [lang]: e.target.value }))}
                                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-zinc-200 resize-none min-h-[80px]"
                                                    placeholder="Enter caption..."
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 mt-6 border-t border-white/10 flex gap-3">
                                <button
                                    onClick={() => setSelectedCreative(null)}
                                    className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveTexts}
                                    disabled={saving}
                                    className="flex-1 py-3 rounded-xl gradient-saffron text-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save Draft"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
