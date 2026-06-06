import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AllRoute from "./routes/AllRoute";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./redux/hook";
import { getAccount, setAuthInitialized } from "./redux/slices/user/authSlice";
import { getCategoriesGrouped } from "./redux/slices/user/cateSlice";
import RealtimeProvider from "./components/contexts/providers/RealtimeProvider";
import { AIChatProvider } from "./contexts/AIChatContext";
import AIChatWidget from "./components/ai/AIChatWidget";

const App = () => {
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken) {
      dispatch(getAccount());
    } else {
      dispatch(setAuthInitialized(true));
    }

    dispatch(getCategoriesGrouped());
  }, [dispatch, accessToken]);

  return (
    <Router>
      <AIChatProvider>
        <RealtimeProvider>
          <AllRoute />
          <AIChatWidget />
        </RealtimeProvider>
      </AIChatProvider>

      <ToastContainer
        position="top-right"
        autoClose={2000}
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
