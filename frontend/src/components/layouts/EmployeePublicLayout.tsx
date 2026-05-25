import { Outlet } from "react-router-dom";
import EmployeePublicFooter from "../commons/employee/EmployeePublicFooter";
import EmployeePublicHeader from "../commons/employee/EmployeePublicHeader";

const EmployeePublicLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <EmployeePublicHeader />

      <main className="flex min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <EmployeePublicFooter />
    </div>
  );
};

export default EmployeePublicLayout;
