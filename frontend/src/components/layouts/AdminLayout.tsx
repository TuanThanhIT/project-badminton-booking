// =========================
// layouts/admin/AdminLayout.tsx
// =========================

import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../commons/admin/AdminSidebar";
import AdminHeader from "../commons/admin/AdminHeader";
import AdminFooter from "../commons/admin/AdminFooter";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-sans text-slate-800 antialiased">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
          <section className="admin-content min-h-full rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-8">
            <Outlet />
          </section>
        </main>

        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;
