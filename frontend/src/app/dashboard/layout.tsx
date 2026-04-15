"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, clearToken } from "@/lib/api";
import type { User } from "@/lib/api";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "⊞" },
  { href: "/dashboard/creatives", label: "Creatives", icon: "🎨" },
  { href: "/dashboard/festivals", label: "Festivals", icon: "🎊" },
  { href: "/dashboard/brand", label: "Brand", icon: "🏷️" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    auth.me()
      .then(setUser)
      .catch(() => {
        clearToken();
        router.push("/login");
      });
  }, [router]);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#0c0c0e]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/5 flex flex-col py-6 px-4 sticky top-0 h-screen">
        <Link href="/" className="px-2 mb-8 block">
          <span className="text-base font-bold gradient-text">IndiSocial</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, label, icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-[#ff6b2b]/15 text-[#ff6b2b]"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                )}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="glass rounded-xl p-3 mt-6">
            <div className="text-xs font-semibold truncate mb-0.5">{user.name}</div>
            <div className="text-xs text-zinc-500 truncate mb-3">{user.email}</div>
            <button
              onClick={handleLogout}
              className="text-xs text-zinc-500 hover:text-white transition-colors"
            >
              Log out →
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 px-8 py-8 overflow-y-auto">{children}</main>
    </div>
  );
}