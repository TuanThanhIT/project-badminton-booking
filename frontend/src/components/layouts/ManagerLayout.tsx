// =========================
// layouts/storeManager/StoreManagerLayout.tsx
// =========================

import { Outlet } from "react-router-dom";
import { useState } from "react";
import ManagerSidebar from "../commons/manager/ManagerSidebar";
import ManagerHeader from "../commons/manager/ManagerHeader";
import ManagerFooter from "../commons/manager/ManagerFooter";

const ManagerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-screen flex bg-slate-100 overflow-hidden">
      <ManagerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ManagerHeader />

        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-100 via-white to-sky-50 p-8">
          <Outlet />
        </main>

        <ManagerFooter />
      </div>
    </div>
  );
};

export default ManagerLayout;
