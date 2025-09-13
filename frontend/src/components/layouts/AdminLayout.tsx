import Header from "../commons/admin/Header";
import Footer from "../commons/admin/Footer";
import { Outlet } from "react-router-dom";
const AdminLayout = () => {
  return (
    <div className="h-screen grid grid-rows-[25%_1fr] w-screen overflow-x-hidden">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
export default AdminLayout;
