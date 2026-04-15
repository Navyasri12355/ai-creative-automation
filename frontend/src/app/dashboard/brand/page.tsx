"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { brands } from "@/lib/api";
import type { Brand, BrandCreate, BrandColor } from "@/lib/api";

const INDUSTRIES = [
    "E-commerce", "Food & Beverage", "Fashion", "Health & Wellness",
    "Education", "Technology", "Real Estate", "Automotive",
    "Finance", "Entertainment", "Retail", "Travel",
];

const REGIONS = [
    "All India", "Maharashtra", "Karnataka", "Tamil Nadu", "Kerala",
    "West Bengal", "Gujarat", "Rajasthan", "Uttar Pradesh",
    "Andhra Pradesh", "Telangana",
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

export default function BrandPage() {
    const [brand, setBrand] = useState<Brand | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [form, setForm] = useState<BrandCreate>({
        name: "",
        industry: "E-commerce",
        target_regions: ["All India"],
        design_style: "modern",
        cultural_sensitivity: "medium",
        language_preferences: ["en", "hi"],
        guidelines: "",
        colors: [
            { name: "Primary", hex: "#ff6b2b", usage: "primary" },
            { name: "Secondary", hex: "#ffb830", usage: "secondary" },
        ],
    });

    useEffect(() => {
        brands.list()
            .then((list) => {
                if (list.length > 0) {
                    const b = list[0];
                    setBrand(b);
                    setForm({
                        name: b.name,
                        industry: b.industry,
                        target_regions: b.target_regions,
                        design_style: b.design_style,
                        cultural_sensitivity: b.cultural_sensitivity,
                        language_preferences: b.language_preferences,
                        guidelines: b.guidelines || "",
                        colors: (b.colors as BrandColor[]) || [],
                    });
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            if (brand) {
                const updated = await brands.update(brand.id, form);
                setBrand(updated);
                setMessage("Brand updated successfully!");
            } else {
                const created = await brands.create(form);
                setBrand(created);
                setMessage("Brand created successfully!");
            }
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    }

    function toggleRegion(region: string) {
        setForm((f) => ({
            ...f,
            target_regions: f.target_regions.includes(region)
                ? f.target_regions.filter((r) => r !== region)
                : [...f.target_regions, region],
        }));
    }

    function toggleLang(code: string) {
        setForm((f) => ({
            ...f,
            language_preferences: f.language_preferences.includes(code)
                ? f.language_preferences.filter((l) => l !== code)
                : [...f.language_preferences, code],
        }));
    }

    function updateColor(index: number, field: keyof BrandColor, value: string) {
        setForm((f) => {
            const colors = [...f.colors];
            colors[index] = { ...colors[index], [field]: value };
            return { ...f, colors };
        });
    }

    function addColor() {
        setForm((f) => ({
            ...f,
            colors: [...f.colors, { name: "New", hex: "#888888", usage: "accent" }],
        }));
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
                Loading brand…
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-2">
                {brand ? "Brand Settings" : "Create Your Brand"}
            </h1>
            <p className="text-sm text-zinc-500 mb-8">
                {brand
                    ? "Update your brand assets and preferences."
                    : "Set up your brand profile to start generating creatives."}
            </p>

            {message && (
                <div
                    className={`text-xs px-4 py-2.5 rounded-xl mb-6 ${message.startsWith("Error")
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                >
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
                {/* Name & Industry */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Brand Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6b2b]/50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Industry</label>
                        <select
                            value={form.industry}
                            onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6b2b]/50"
                        >
                            {INDUSTRIES.map((i) => (
                                <option key={i} value={i} className="bg-zinc-900">{i}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Design Style */}
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">Design Style</label>
                    <div className="flex gap-2">
                        {(["modern", "traditional", "minimal", "vibrant"] as const).map((style) => (
                            <button
                                key={style}
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, design_style: style }))}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${form.design_style === style
                                        ? "gradient-saffron text-black"
                                        : "glass text-zinc-400 hover:text-white"
                                    }`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Target Regions */}
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">Target Regions</label>
                    <div className="flex flex-wrap gap-2">
                        {REGIONS.map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => toggleRegion(r)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.target_regions.includes(r)
                                        ? "bg-[#ff6b2b]/20 text-[#ff6b2b] border border-[#ff6b2b]/30"
                                        : "glass text-zinc-500 hover:text-white"
                                    }`}
                            >
                                {r}
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
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.language_preferences.includes(l.code)
                                        ? "bg-[#4361ee]/20 text-[#4361ee] border border-[#4361ee]/30"
                                        : "glass text-zinc-500 hover:text-white"
                                    }`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Brand Colors */}
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-2">Brand Colors</label>
                    <div className="space-y-2">
                        {form.colors.map((color, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={color.hex}
                                    onChange={(e) => updateColor(i, "hex", e.target.value)}
                                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={color.name}
                                    onChange={(e) => updateColor(i, "name", e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff6b2b]/50"
                                />
                                <span className="text-xs text-zinc-500 font-mono">{color.hex}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addColor}
                        className="mt-2 text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                        + Add color
                    </button>
                </div>

                {/* Guidelines */}
                <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                        Brand Guidelines (optional)
                    </label>
                    <textarea
                        value={form.guidelines}
                        onChange={(e) => setForm((f) => ({ ...f, guidelines: e.target.value }))}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6b2b]/50 resize-none"
                        placeholder="Describe your brand tone, style preferences, dos and don'ts…"
                    />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 rounded-xl gradient-saffron text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {saving ? "Saving…" : brand ? "Update brand" : "Create brand"}
                </button>
            </form>
        </div>
    );
}
