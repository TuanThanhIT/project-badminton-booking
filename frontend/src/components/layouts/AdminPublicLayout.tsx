// components/layouts/AdminPublicLayout.tsx

import { Outlet } from "react-router-dom";
import AdminPublicHeader from "../commons/admin/AdminPublicHeader";
import AdminPublicFooter from "../commons/admin/AdminPublicFooter";

const AdminPublicLayout = () => {
  return (
    <div
      className="
        h-screen
        flex flex-col
        overflow-hidden

        bg-gradient-to-br
        from-sky-50
        via-white
        to-cyan-50
      "
    >
      {/* HEADER */}
      <AdminPublicHeader />

      {/* MAIN */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* FOOTER */}
      <AdminPublicFooter />
    </div>
  );
};

export default AdminPublicLayout;
