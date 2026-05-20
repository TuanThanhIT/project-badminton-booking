// components/layouts/AdminPublicLayout.tsx

import { Outlet } from "react-router-dom";
import AdminPublicHeader from "../commons/admin/AdminPublicHeader";
import AdminPublicFooter from "../commons/admin/AdminPublicFooter";

const AdminPublicLayout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <AdminPublicHeader />

      <main className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </main>

      <AdminPublicFooter />
    </div>
  );
};

export default AdminPublicLayout;
