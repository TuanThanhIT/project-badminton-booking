import Header from "../commons/customer/Header";
import Footer from "../commons/customer/Footer";
import { Outlet } from "react-router-dom";

const CustomerPrivateLayout = () => {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerPrivateLayout;
