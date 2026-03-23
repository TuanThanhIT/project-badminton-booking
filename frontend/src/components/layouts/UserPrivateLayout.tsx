import Header from "../commons/user/Header";
import Footer from "../commons/user/Footer";
import { Outlet } from "react-router-dom";
import ScrollToTopButton from "../ui/customer+employee/ScrollToTopButton";
import { useRef } from "react";

const UserPrivateLayout = () => {
  const cartRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <Header cartRef={cartRef} />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        <main className="min-h-0">
          <Outlet context={{ cartRef }} />
        </main>

        <Footer />
      </div>

      <ScrollToTopButton />
    </div>
  );
};

export default UserPrivateLayout;
