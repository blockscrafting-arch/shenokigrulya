import { redirect } from "next/navigation";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getAdminFromRequest();
  if (admin) redirect("/admin/dashboard");
  redirect("/admin/login");
}
