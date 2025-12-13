import Header from "../commons/employee/EmployeeHeader";
import { Outlet } from "react-router-dom";

const EmployeeLayout = () => {
  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      {/* HEADER – FIXED */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <Header />
      </div>

      {/* 🔥 SCROLL AREA */}
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout;
