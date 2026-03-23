import { useSearchParams } from "react-router-dom";

const WalletDepositSuccess = () => {
  const [searchParams] = useSearchParams();
  console.log("params>>", searchParams);
  searchParams.forEach((value, key) => {
    console.log("value>>", value);
    console.log("key>>", key);
  });

  return <div>Thanh toán thành công</div>;
};

export default WalletDepositSuccess;
