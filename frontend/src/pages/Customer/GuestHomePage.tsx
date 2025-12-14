import AboutUsSection from "../../components/ui/customer+employee/AboutUsSection";
import BadmintonNewSection from "../../components/ui/customer+employee/BadmintonNewSection";
import BadmintonSection from "../../components/ui/customer+employee/BadmintonSection";
import ContactSection from "../../components/ui/customer+employee/ContactSection";
import CourtSection from "../../components/ui/customer+employee/CourtSection";
import DiscountSection from "../../components/ui/customer+employee/DiscountSection";
import HeroBanner from "../../components/ui/customer+employee/HeroBanner";

const GuestHomePage = () => {
  return (
    <div className="w-full">
      <HeroBanner />
      <main className="max-w-7xl mx-auto p-10 space-y-12">
        <DiscountSection />
        {/* Badminton new product */}
        <BadmintonNewSection />
        {/* Badminton Product */}
        <BadmintonSection />
        {/* Court */}
        <CourtSection />
        {/* About us */}
        <AboutUsSection />
        {/* Contact */}
        <ContactSection />
      </main>
    </div>
  );
};
export default GuestHomePage;
