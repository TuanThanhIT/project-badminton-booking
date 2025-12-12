import Header from "../commons/admin/Header";
import Footer from "../commons/admin/Footer";
import Sidebar from "../commons/admin/Sidebar";
import { Outlet } from "react-router-dom";
import { SideBarContext } from "../contexts/sidebarContext";
import { useContext } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const AdminLayout = () => {
  const sideBarContext = useContext(SideBarContext);
  const expanded = sideBarContext?.expanded;
  return (
    <>
      <div
        className={
          expanded
            ? "h-screen grid grid-cols-[1fr_5fr] w-screen "
            : "h-screen grid grid-cols-[auto_5fr] w-screen"
        }
      >
        <div className="z-70">
          <Sidebar />
        </div>
        <div className="grid grid-rows-[auto_1fr_auto] h-screen overflow-x-hidden   ">
          <div className="sticky top-0 bg-background shadow-sm z-70">
            <Header />
          </div>
          <div>
            <main className=" p-4 h-full min-h-0 overflow-y-auto  ">
              <Outlet />
            </main>
          </div>
          <div className="">
            <Footer />
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        pauseOnHover
        closeOnClick
      />
    </>
  );
};
export default AdminLayout;
