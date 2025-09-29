import { BrowserRouter as Router } from "react-router-dom";
import CustomerRoute from "./routes/CusRoute";
import { AuthProvider } from "./components/contexts/authProvider";
import { ToastContainer } from "react-toastify";

const App = () => (
  <AuthProvider>
    <Router>
      <CustomerRoute />
    </Router>
  </AuthProvider>
);

export default App;
