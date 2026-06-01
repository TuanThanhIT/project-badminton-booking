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
    <div className="h-screen flex bg-slate-50 overflow-hidden font-sans text-slate-800">
      <ManagerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ManagerHeader />

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        <ManagerFooter />
      </div>
    </div>
  );
};

export default ManagerLayout;
