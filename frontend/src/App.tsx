import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AllRoute from "./routes/AllRoute";
import { useEffect } from "react";
import { useAppDispatch } from "./redux/hook";
import { getAccount } from "./redux/slices/user/authSlice";
import { getCategoriesGrouped } from "./redux/slices/user/cateSlice";

const App = () => {
  const token = localStorage.getItem("access_token");
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (token) {
      dispatch(getAccount());
      dispatch(getCategoriesGrouped());
    }
  }, []);

  return (
    <Router>
      <AllRoute />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
};

export default App;
