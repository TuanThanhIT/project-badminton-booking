import Header from "../commons/customer/Header";
import Footer from "../commons/customer/Footer";
import { Outlet } from "react-router-dom";
import ScrollToTopButton from "../ui/ScrollToTopButton";

const CustomerPublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default CustomerPublicLayout;
