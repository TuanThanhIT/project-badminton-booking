import Header from "../commons/employee/EmployeeHeader";
import { Outlet } from "react-router-dom";

const EmployeeLayout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Header />
      <main className="flex-1 overflow-visible">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout;
