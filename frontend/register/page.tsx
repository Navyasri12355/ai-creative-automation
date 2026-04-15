"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, setToken } from "@/lib/api";

const ROLES = [
  { value: "brand-admin", label: "Brand Admin" },
  { value: "marketing-manager", label: "Marketing Manager" },
  { value: "content-creator", label: "Content Creator" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "brand-admin",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await auth.register(form);
      setToken(res.access_token);
      router.push("/dashboard/brand");
    } catch (err: any) {
      setError(err.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="text-xl font-bold gradient-text">
            IndiSocial
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Create account</h1>
          <p className="text-sm text-zinc-500">Start generating in minutes</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-7 space-y-5">
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {(["name", "email", "password"] as const).map((field) => (
            <div key={field}>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 capitalize">
                {field}
              </label>
              <input
                type={field === "email" ? "email" : field === "password" ? "password" : "text"}
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                required
                minLength={field === "password" ? 8 : undefined}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#ff6b2b]/50"
                placeholder={
                  field === "name" ? "Your name" :
                  field === "email" ? "you@brand.com" : "Min 8 characters"
                }
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#ff6b2b]/50"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-zinc-900">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-saffron text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#ff6b2b] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}