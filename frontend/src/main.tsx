import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { AuthProvider } from "./components/contexts/auth/authProvider";
import ConfirmDialogProvider from "./components/contexts/providers/ConfirmDialogProvider";
import { ConfigProvider, theme } from "antd";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      componentSize="middle"
      theme={{
        algorithm: theme.compactAlgorithm,
        token: {
          borderRadius: 10,
          borderRadiusLG: 14,
          controlHeight: 34,
          controlHeightLG: 38,
          controlHeightSM: 28,
          fontSize: 13,
          fontSizeLG: 15,
          fontSizeSM: 12,
          padding: 14,
          paddingLG: 18,
          paddingSM: 10,
          margin: 14,
          marginLG: 18,
          marginSM: 10,
        },
      }}
    >
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AuthProvider>
            <ConfirmDialogProvider>
              <App />
            </ConfirmDialogProvider>
          </AuthProvider>
        </PersistGate>
      </Provider>
    </ConfigProvider>
  </StrictMode>,
);
