import { Route, Routes } from "react-router-dom";
import ManagerLayout from "../components/layouts/ManagerLayout";
import DashboardPage from "../pages/manager/DashboardPage";

const ManagerRoute = () => {
  return (
    <Routes>
      <Route element={<ManagerLayout />}>
        <Route path="dashboard" element={<DashboardPage />}></Route>
      </Route>
    </Routes>
  );
};

export default ManagerRoute;
