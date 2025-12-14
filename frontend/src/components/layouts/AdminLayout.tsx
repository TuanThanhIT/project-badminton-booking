// AdminLayout.tsx
import Header from "../commons/admin/Header";
import Footer from "../commons/admin/Footer";
import Sidebar from "../commons/admin/Sidebar";
import { Outlet } from "react-router-dom";
import { SideBarContext } from "../contexts/sidebarContext";
import { useState } from "react";

const AdminLayout = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <SideBarContext.Provider value={{ expanded, setExpanded }}>
      <div
        className={`h-screen grid overflow-hidden ${
          expanded ? "grid-cols-[260px_1fr]" : "grid-cols-[80px_1fr]"
        }`}
      >
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN */}
        <div className="flex flex-col min-h-screen bg-white">
          {/* HEADER */}
          <div className="sticky top-0 z-40">
            <Header />
          </div>

          {/* CONTENT + FOOTER */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-1">
              <Outlet />
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </SideBarContext.Provider>
  );
};

export default AdminLayout;
