import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import CustomerRoute from "./routes/CusRoute";
import AdminRoute from "./routes/AdminRoute";
import { Provider } from "react-redux";
import { persistor, store } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      {/* <Routes>
        <Route element={<CustomerRoute />}></Route>
        <Route element={<AdminRoute />}></Route>
      </Routes> */}
      <AdminRoute />
      {/* <CustomerRoute /> */}
    </Router>
  </StrictMode>
);
