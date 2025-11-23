import "./App.css";
import { BrowserRouter as Router } from "react-router-dom";
import CustomerRoute from "./routes/CusRoute";
import { AuthProvider } from "./components/contexts/authProvider";
import { ToastContainer } from "react-toastify";
import "./App.css";

const App = () => (
  <AuthProvider>
    <Router>
      <CustomerRoute />
    </Router>
    {/* Container chung cho toàn bộ app */}
    <ToastContainer
      position="bottom-right"
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
