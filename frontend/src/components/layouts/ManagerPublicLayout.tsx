import { Outlet } from "react-router-dom";
import ManagerPublicHeader from "../commons/manager/ManagerPublicHeader";
import ManagerPublicFooter from "../commons/manager/ManagerPublicFooter";

const ManagerPublicLayout = () => {
  return (
    <div
      className="
        h-screen
        flex flex-col
        overflow-hidden

        bg-gradient-to-br
        from-cyan-50
        via-white
        to-sky-50
      "
    >
      {/* HEADER */}
      <ManagerPublicHeader />

      {/* MAIN */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* FOOTER */}
      <ManagerPublicFooter />
    </div>
  );
};

export default ManagerPublicLayout;
