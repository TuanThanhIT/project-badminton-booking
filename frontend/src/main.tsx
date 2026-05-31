import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { AuthProvider } from "./components/contexts/auth/authProvider";
import ConfirmDialogProvider from "./components/contexts/providers/ConfirmDialogProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <ConfirmDialogProvider>
            <App />
          </ConfirmDialogProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
);
