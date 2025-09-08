import { NavLink, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = ({ closeSidebar, isCollapsed }) => {
  const { t } = useTranslation();
  const { user, bizType } = useAuth();
  const location = useLocation();

  const toTitleCase = (str) => {
    return str
      ?.toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const baseClass = `
    flex items-center gap-2
    p-2 rounded-lg transition-all duration-200
    font-medium
    ${isCollapsed ? "justify-center" : ""}
  `;

  const activeClass = "bg-white text-blue-500 shadow";
  const normalClass = "text-gray-100 hover:bg-blue-800 hover:text-white";

  //Tentukan path tujuan berdasarkan bizType
  const orderTakingPath = bizType === "10002" ? "/table" : "/pos";

  //Tentukan logika status aktif
  const isOrderTakingActive =
    bizType === "10002"
      ? location.pathname === "/table" || location.pathname === "/pos"
      : location.pathname === "/pos";
  return (
    <aside
      className={`h-full bg-blue-500 px-2 py-4 z-50 relative  ${
        isCollapsed ? "w-16 pt-20" : "w-64"
      }`}
    >
      {/* Close button for mobile */}
      {closeSidebar && (
        <button
          onClick={closeSidebar}
          className="absolute top-1 right-1 text-white md:hidden"
        >
          <Icon icon="solar:close-circle-bold" className="text-2xl" />
        </button>
      )}

      {/* Collapse/Expand button for desktop */}
      <button
        onClick={closeSidebar}
        className="hidden md:flex items-center justify-center absolute -right-12 top-1 w-10 h-10 bg-white border border-blue-500 rounded-full p-1 shadow-sm"
      >
        <Icon
          icon={
            isCollapsed
              ? "solar:hamburger-menu-linear"
              : "solar:hamburger-menu-line-duotone"
          }
          className="text-blue-500 text-xl"
        />
      </button>

      {/* header */}
      <h2
        className={`text-white tracking-wide flex items-center px-2 ${
          isCollapsed ? "justify-center" : ""
        }`}
      >
        {!isCollapsed && (
          <span className="text-2xl font-bold">
            {user?.company?.company_nm || "Nama PT"}
          </span>
        )}
      </h2>
      {!isCollapsed && (
        <p className="text-sm text-gray-300 font-medium px-2 pb-5 ">
          {t("branch")}:{" "}
          <span className=" font-semibold">
            {toTitleCase(user?.branch?.branch_nm) || t("unknownBranch")}
          </span>
        </p>
      )}

      <nav className="flex flex-col gap-1">
        <NavLink
          to={orderTakingPath}
          className={`${baseClass} ${
            isOrderTakingActive ? activeClass : normalClass
          }`}
          title={t("orderTaking")}
        >
          <Icon icon="solar:cart-large-2-bold" className="text-3xl" />
          {!isCollapsed && (
            <span className="text-base">{t("orderTaking")}</span>
          )}
        </NavLink>

        <NavLink
          to="/product"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : normalClass}`
          }
          title={t("productManagement")}
        >
          <Icon icon="solar:box-bold" className="text-3xl" />
          {!isCollapsed && (
            <span className="text-base">{t("productManagement")}</span>
          )}
        </NavLink>

        <NavLink
          to="/order-offline"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : normalClass}`
          }
          title={t("orderOffline")}
        >
          <Icon icon="solar:document-add-bold" className="text-3xl" />
          {!isCollapsed && (
            <span className="text-base">{t("orderOffline")}</span>
          )}
        </NavLink>

        <NavLink
          to="/order-online"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : normalClass}`
          }
          title={t("orderOnline")}
        >
          <Icon icon="solar:documents-bold" className="text-3xl" />
          {!isCollapsed && (
            <span className="text-base">{t("orderOnline")}</span>
          )}
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : normalClass}`
          }
          title={t("salesDashboard")}
        >
          <Icon icon="solar:graph-up-bold" className="text-3xl" />
          {!isCollapsed && (
            <span className="text-base">{t("salesDashboard")}</span>
          )}
        </NavLink>

        <NavLink
          to="/sod"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : normalClass}`
          }
          title={t("startOfDay")}
        >
          <Icon icon="solar:clipboard-list-bold" className="text-3xl" />
          {!isCollapsed && <span className="text-base">{t("startOfDay")}</span>}
        </NavLink>

        <NavLink
          to="/kas"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : normalClass}`
          }
          title={t("cashRegister")}
        >
          <Icon icon="solar:banknote-bold" className="text-3xl" />
          {!isCollapsed && (
            <span className="text-base">{t("cashRegister")}</span>
          )}
        </NavLink>

        <NavLink
          to="/report"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : normalClass}`
          }
          title={t("closing")}
        >
          <Icon icon="solar:book-bold" className="text-3xl" />
          {!isCollapsed && <span className="text-base">{t("closing")}</span>}
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
