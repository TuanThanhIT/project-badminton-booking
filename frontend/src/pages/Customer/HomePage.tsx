import BadmintonSection from "../../components/ui/BadmintonSection";
import HeroBanner from "../../components/ui/HeroBanner";

const HomePage = () => {
  return (
    <div className="w-full">
      <HeroBanner />
      <main className="max-w-7xl mx-auto p-10 space-y-12">
        {/* Badminton Product */}
        <BadmintonSection />
      </main>
    </div>
  );
};
export default HomePage;
