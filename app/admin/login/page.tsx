import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getCurrentAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Administrator sign in" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <a className="admin-brand" href="/" aria-label="Ritewheel Autos home">
          <span className="admin-brand-mark">R</span>
          <span>RITEWHEEL <b>AUTOS</b></span>
        </a>
        <div className="admin-login-heading">
          <span className="eyebrow">DEALERSHIP WORKSPACE</span>
          <h1>Welcome back.</h1>
          <p>Sign in to manage vehicle listings and dealership inventory.</p>
        </div>
        <AdminLoginForm />
        <p className="admin-login-footnote">Authorised dealership administrators only.</p>
      </div>
    </main>
  );
}
