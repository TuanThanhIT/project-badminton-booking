import Header from "../commons/customer/Header";
import Footer from "../commons/customer/Footer";
import { Outlet } from "react-router-dom";

const CustomerLayout = () => {
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
export default CustomerLayout;
