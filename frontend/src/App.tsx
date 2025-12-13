import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./components/contexts/authProvider";
import { ToastContainer } from "react-toastify";
import "./App.css";
import AllRoute from "./routes/AllRoute";

const App = () => (
  <AuthProvider>
    <Router>
      <AllRoute />
    </Router>
    {/* Container chung cho toàn bộ app */}
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      draggable
      pauseOnHover
      theme="colored"
    />
    ;
  </AuthProvider>
);

export default App;
