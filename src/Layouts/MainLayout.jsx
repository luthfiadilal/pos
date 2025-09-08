import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import OfflineBanner from "../components/OfflineBanner";

export default function MainLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(true);

  const { user } = useAuth();
  const userName = user?.name || "User Cashier";
  const companyName = user?.company?.company_nm || "PT Wangga Tanghuru";

  const toggleDesktopSidebar = () => {
    setDesktopSidebarCollapsed(!desktopSidebarCollapsed);
  };

  const shouldHideCompanyName = mobileSidebarOpen || !desktopSidebarCollapsed;

  return (
    <>
      {/* Offline Banner */}
      <OfflineBanner />

      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Desktop Sidebar */}
        <div
          className={`hidden md:block ${
            desktopSidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <Sidebar
            closeSidebar={toggleDesktopSidebar}
            isCollapsed={desktopSidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-black bg-opacity-40"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <Sidebar closeSidebar={() => setMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-blue-500 overflow-hidden">
          <Header
            userName={userName}
            companyName={companyName}
            onHamburgerClick={() => setMobileSidebarOpen(true)}
            hideCompanyName={shouldHideCompanyName}
          />

          <main className="flex-1 overflow-y-auto bg-white rounded-tl-[16px]">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
