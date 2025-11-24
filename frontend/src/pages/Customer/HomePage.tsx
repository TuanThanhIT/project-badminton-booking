import AboutUsSection from "../../components/ui/AboutUsSection";
import BadmintonNewSection from "../../components/ui/BadmintonNewSection";
import BadmintonSection from "../../components/ui/BadmintonSection";
import ContactSection from "../../components/ui/ContactSection";
import CourtSection from "../../components/ui/CourtSection";
import DiscountSection from "../../components/ui/DiscountSection";
import HeroBanner from "../../components/ui/HeroBanner";

const HomePage = () => {
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
export default HomePage;
