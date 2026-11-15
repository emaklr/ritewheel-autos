import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminWorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await requireAdminPage();
  return <AdminShell adminName={admin.name || admin.email}>{children}</AdminShell>;
}
