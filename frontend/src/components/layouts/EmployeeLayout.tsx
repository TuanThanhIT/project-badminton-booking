import Header from "../commons/employee/EmployeeHeader";
import { Outlet } from "react-router-dom";

const EmployeeLayout = () => {
  return (
    <div className="h-screen w-full flex flex-col">
      <Header />
      {/* Main scrollable nếu nội dung dài */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployeeLayout;
