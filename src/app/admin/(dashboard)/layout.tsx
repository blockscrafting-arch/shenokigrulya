import { redirect } from "next/navigation";
import { getAdminFromRequest } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminFromRequest();
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
