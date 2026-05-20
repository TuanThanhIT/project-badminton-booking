import { Outlet } from "react-router-dom";
import ManagerPublicHeader from "../commons/manager/ManagerPublicHeader";
import ManagerPublicFooter from "../commons/manager/ManagerPublicFooter";

const ManagerPublicLayout = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <ManagerPublicHeader />

      <main className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </main>

      <ManagerPublicFooter />
    </div>
  );
};

export default ManagerPublicLayout;
