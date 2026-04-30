import { isAdminAuthenticated } from "@/lib/admin-auth";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAuthenticated = await isAdminAuthenticated();
  return <AdminDashboard initialAuthenticated={isAuthenticated} />;
}
