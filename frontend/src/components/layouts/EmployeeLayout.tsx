import { Outlet } from "react-router-dom";
import EmployeeHeader from "../commons/employee/EmployeeHeader";

const EmployeeLayout = () => {
  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-800">
      <EmployeeHeader />

      <main className="h-[calc(100vh-70px)] overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout;
