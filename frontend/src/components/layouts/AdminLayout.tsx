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
    <div className="h-screen flex overflow-hidden bg-slate-100">
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader collapsed={collapsed} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
          <Outlet />
        </main>

        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminLayout;
