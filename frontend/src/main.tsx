import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import CustomerRoute from "./routes/CusRoute";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <CustomerRoute />
    </Router>
  </StrictMode>
);
