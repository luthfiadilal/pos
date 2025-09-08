import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import POS from "../pages/POS";
import MainLayout from "../Layouts/MainLayout";
import Login from "../pages/Login";
import ProductManagement from "../pages/Product";
import OrderOfflineOverview from "../pages/OrderOffline";
import OrderOnlineOverview from "../pages/OrderOnline";
import Dashboard from "../pages/Dashboard";
import ClosingPOS from "../pages/ClosingPOS";
import StartOfDay from "../pages/StartOfDay";
import ProtectedRoute from "../components/ProtectedRoute";
import MejaPage from "../pages/Table";
import Kas from "../pages/Kas";

import { useState } from "react";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      {/* Routes with Nosidebarlayout */}

      {/* Routes with Mainlayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/pos" element={<POS />} />
        <Route path="/product" element={<ProductManagement />} />
        <Route path="/order-offline" element={<OrderOfflineOverview />} />
        <Route path="/order-online" element={<OrderOnlineOverview />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report" element={<ClosingPOS />} />
        <Route path="/table" element={<MejaPage />} />
        <Route path="/kas" element={<Kas />} />
        <Route path="/sod" element={<StartOfDay />} />
      </Route>
    </Routes>
  );
}
