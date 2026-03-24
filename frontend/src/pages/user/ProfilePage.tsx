import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const navigate = useNavigate();
  return (
    <div className="p-10">
      <button className="border" onClick={() => navigate("/wallet")}>
        Ví thanh toán
      </button>
      <p>Đây là trang profile</p>
    </div>
  );
};
export default ProfilePage;
