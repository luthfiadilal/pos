import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { OfflineProvider } from "./contexts/OfflineContext.jsx";
import { OrderProvider } from "./contexts/OrderContext.jsx";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <OrderProvider>
          <OfflineProvider>
            <App />
          </OfflineProvider>
        </OrderProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
