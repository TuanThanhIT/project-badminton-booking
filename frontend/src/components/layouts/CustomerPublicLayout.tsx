import Header from "../commons/customer/Header";
import Footer from "../commons/customer/Footer";
import { Outlet } from "react-router-dom";
import ScrollToTopButton from "../ui/ScrollToTopButton";

const CustomerPublicLayout = () => {
  return (
    // ❌ KHÔNG dùng min-h-screen ở đây
    <div className="h-screen flex flex-col overflow-hidden">
      {/* HEADER – FIXED */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <Header />
      </div>

      {/* 🔥 SCROLL AREA (MAIN + FOOTER) */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <main className="min-h-0">
          <Outlet />
        </main>

        {/* FOOTER TRONG SCROLL */}
        <Footer />
      </div>

      <ScrollToTopButton />
    </div>
  );
};

export default CustomerPublicLayout;
