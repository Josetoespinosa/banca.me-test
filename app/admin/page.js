import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";

export default function AdminPage() {
  return (
    <>
      <Header />
      <AdminDashboard />
      <Footer />
    </>
  );
}
