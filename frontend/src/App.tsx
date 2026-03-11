import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AllRoute from "./routes/AllRoute";

const App = () => (
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

export default App;
