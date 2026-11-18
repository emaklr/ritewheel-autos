"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navigation = [
  { href: "/admin", label: "Overview", icon: "⌂" },
  { href: "/admin/vehicles", label: "Inventory", icon: "▣" },
  { href: "/admin/enquiries", label: "Enquiries", icon: "✉" },
];

export function AdminShell({
  adminName,
  children,
}: Readonly<{ adminName: string; children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } finally {
      router.replace("/admin/login");
      router.refresh();
      setSigningOut(false);
    }
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin" aria-label="Ritewheel admin overview">
          <span className="admin-brand-mark">R</span>
          <span>RITEWHEEL <b>ADMIN</b></span>
        </Link>

        <div className="admin-sidebar-caption">WORKSPACE</div>
        <nav className="admin-sidebar-nav" aria-label="Administrator navigation">
          {navigation.map((item) => {
            const active = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? "is-active" : ""}>
                <span className="admin-nav-icon" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-bottom">
          <span className="admin-sidebar-caption">SIGNED IN AS</span>
          <strong>{adminName}</strong>
          <span className="admin-role-label">Administrator</span>
          <button type="button" className="admin-signout" onClick={signOut} disabled={signingOut}>
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <span className="admin-topbar-label">RITEWHEEL AUTOS</span>
            <span className="admin-topbar-separator">/</span>
            <span>Dealership workspace</span>
          </div>
          <div className="admin-topbar-user">
            <span className="admin-user-avatar">{adminName.trim().charAt(0).toUpperCase() || "A"}</span>
            <span>{adminName}</span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
