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
      {/* CHỈ 1 h-screen */}
      <div
        className={`h-screen grid overflow-hidden ${
          expanded ? "grid-cols-[260px_1fr]" : "grid-cols-[80px_1fr]"
        }`}
      >
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN */}
        <div className="flex flex-col min-h-screen">
          {/* HEADER */}
          <div className="sticky top-0 z-40 bg-white shadow-sm">
            <Header />
          </div>

          {/* CONTENT + FOOTER */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Outlet chiếm không gian còn lại */}
            <div className="flex-1 p-4">
              <Outlet />
            </div>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </div>
    </SideBarContext.Provider>
  );
};

export default AdminLayout;
