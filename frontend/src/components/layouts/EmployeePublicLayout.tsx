import { Outlet } from "react-router-dom";
import EmployeePublicFooter from "../commons/employee/EmployeePublicFooter";
import EmployeePublicHeader from "../commons/employee/EmployeePublicHeader";

const EmployeePublicLayout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <EmployeePublicHeader />

      <main className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </main>

      <EmployeePublicFooter />
    </div>
  );
};

export default EmployeePublicLayout;
