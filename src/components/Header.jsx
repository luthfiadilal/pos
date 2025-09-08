import { Icon } from "@iconify/react";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";

export default function Header({
  userName = "Guest",
  companyName = "PT Wangga Tanghuru",
  onHamburgerClick,
  hideCompanyName = false,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const langRef = useRef(null);
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString(
      i18n.language === "ko"
        ? "ko-KR"
        : i18n.language === "en"
        ? "en-US"
        : "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );

  const formatDay = (date) =>
    date.toLocaleDateString(
      i18n.language === "ko"
        ? "ko-KR"
        : i18n.language === "en"
        ? "en-US"
        : "id-ID",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const flags = [
    {
      code: "id",
      src: "/images/flags/indonesia.png",
      alt: "Indonesia",
    },
    { code: "en", src: "/images/flags/us.png", alt: "English" },
    { code: "ko", src: "/images/flags/kr.png", alt: "Korean" },
  ];

  return (
    <>
      <header className="flex items-center justify-between bg-blue-500 md:px-8 py-1 px-2 relative">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button onClick={onHamburgerClick} className="text-white md:hidden">
            <Icon icon="solar:hamburger-menu-bold" className="text-2xl" />
          </button>
          {!hideCompanyName && (
            <h1 className="ml-6 text-sm md:text-xl font-bold text-white leading-tight break-words max-w-[140px] sm:max-w-xs md:max-w-sm">
              {companyName}
            </h1>
          )}
        </div>

        {/* Center */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h2 className="md:text-2xl text-md font-extrabold text-white">
            EasyPOS
          </h2>
        </div>

        {/* Right */}
        <div className="text-sm text-gray-300 font-medium flex items-center gap-4">
          {/* Time + Date */}
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-100">
              {formatDay(currentTime)}
            </div>
            <div className="text-base font-semibold text-white">
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Mobile - User Dropdown */}
          <div className="relative flex" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center justify-center md:justify-start w-10 md:w-auto h-10 rounded-full hover:bg-blue-800 transition-colors text-white px-2"
              aria-label="User menu"
            >
              {/* Icon selalu muncul */}
              <Icon icon="solar:user-circle-linear" width="26" height="26" />

              {/* Username hanya tampil di desktop */}
              <div className="hidden md:flex items-center gap-2 ml-2 text-white">
                <span>{userName}</span>
              </div>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-10 w-56 rounded-xl shadow-xl py-2 z-50 backdrop-blur-sm bg-white/10 border border-white/20 ring-1 ring-white/10 bg-blue-800/30 border border-white/20 ring-1 ring-white/10">
                {/* User Info */}
                <div className="flex items-center px-4 py-3 gap-3 border-b border-black/10">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white">
                    <Icon
                      icon="solar:user-circle-linear"
                      width="22"
                      height="22"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-600">{t("user_account")}</p>
                  </div>
                </div>

                {/* Language Flags */}
                <div className="flex justify-center px-3 py-3 gap-5 border-b border-black/10">
                  {flags.map(({ code, src, alt }) => (
                    <button
                      key={code}
                      onClick={() => changeLanguage(code)}
                      className={`p-1 rounded-md border ${
                        i18n.language === code
                          ? "border-white ring-2 ring-blue-200"
                          : "border-transparent"
                      } hover:ring-2 hover:ring-white transition`}
                      title={alt}
                    >
                      <img
                        src={src}
                        alt={alt}
                        className="w-10 h-8 object-cover border border-gray rounded"
                      />
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-800 hover:bg-blue-600/50 transition-colors gap-2"
                >
                  <Icon
                    icon="solar:logout-3-line-duotone"
                    width="20"
                    height="20"
                    className="text-red-400"
                  />
                  <span>{t("logout")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-sm text-center animate-fade-in">
            <Icon
              icon="solar:logout-3-line-duotone"
              className="text-red-500 text-4xl mx-auto mb-4"
            />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {t("logout_confirm")}
            </h2>
            <p className="text-sm text-gray-500 mb-6">{t("logout_message")}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
              >
                {t("confirm_logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
