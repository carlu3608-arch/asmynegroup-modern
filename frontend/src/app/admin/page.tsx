import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";
import AdminDashboard from "./AdminDashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const admin = verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!admin) {
    redirect("/admin/login");
  }
  return <AdminDashboard adminEmail={admin.email} />;
}
