import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function NoSidebarLayout() {
  const { user } = useAuth();
  const userName = user?.name || "User Cashier";
  const companyName = user?.company?.company_nm || "PT Wangga Tanghuru";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Header */}
      <Header userName={userName} companyName={companyName} />

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto bg-white rounded-tl-[16px]">
        <Outlet />
      </main>
    </div>
  );
}
