import WalletPanel from "../../components/ui/user/wallet/WalletPanel";

const WalletPage = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="mx-auto max-w-[1180px] px-3 sm:px-4 lg:px-6">
        <WalletPanel />
      </div>
    </div>
  );
};

export default WalletPage;
