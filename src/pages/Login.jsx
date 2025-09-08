import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("✅ Login.jsx component MOUNTED (dibuat)");
    return () => {
      console.error("❌ Login.jsx component UNMOUNTED (dihapus!)");
    };
  }, []);

  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setUsernameError("");
    setPasswordError("");

    let hasError = false;

    if (username.trim() === "") {
      setUsernameError(t("username_required"));
      hasError = true;
    }

    if (password.trim() === "") {
      setPasswordError(t("password_required"));
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      const res = await login(username, password);

      const bizType = res.data.compBizType.comp_biz_type;

      if (bizType === "10002") {
        // Tipe Resto
        navigate("/table");
      } else {
        // Tipe Cafe
        navigate("/pos");
      }
    } catch (err) {
      setError(err?.response?.data?.message || t("login_error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full bg-slate-100 px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8 gap-2">
          <Icon
            icon="solar:pos-terminal-bold-duotone"
            className="text-3xl text-indigo-600"
          />
          <span className="text-3xl font-bold text-indigo-600">EasyPOS</span>
        </div>

        {/* Language */}
        <div className="flex justify-center mb-4 gap-3">
          {[
            {
              code: "id",
              src: "/images/flags/indonesia.png",
              alt: "Indonesia",
            },
            { code: "en", src: "/images/flags/us.png", alt: "English" },
            { code: "ko", src: "/images/flags/kr.png", alt: "Korean" },
          ].map(({ code, src, alt }) => (
            <button
              key={code}
              onClick={() => handleChangeLanguage(code)}
              className={`p-1 rounded-md border ${
                i18n.language === code
                  ? "border-blue-600 ring-2 ring-blue-300"
                  : "border-gray-300"
              } hover:ring-2 hover:ring-blue-200 transition`}
            >
              <img
                src={src}
                alt={alt}
                className="w-12 h-10 object-cover rounded"
              />
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t("username")}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-3 border bg-slate-50 rounded-lg focus:outline-none focus:ring-2 transition ${
                  usernameError
                    ? "border-red-400 focus:ring-red-300"
                    : "border-slate-300 focus:ring-indigo-400 focus:border-indigo-500"
                }`}
                disabled={isLoading}
              />
              <Icon
                icon="solar:user-linear"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"
              />
            </div>
            {usernameError && (
              <p className="text-red-500 text-sm mt-1.5">{usernameError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t("password")}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border bg-slate-50 rounded-lg focus:outline-none focus:ring-2 transition ${
                  passwordError
                    ? "border-red-400 focus:ring-red-300"
                    : "border-slate-300 focus:ring-indigo-400 focus:border-indigo-500"
                }`}
                disabled={isLoading}
              />
              <Icon
                icon="solar:lock-linear"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg"
              />
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm mt-1.5">{passwordError}</p>
            )}
          </div>

          {error && (
            <p className="text-red-700 text-sm text-center bg-red-100 p-3 rounded-md">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
              isLoading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40"
            }`}
          >
            {isLoading ? (
              <>
                <Icon icon="eos-icons:loading" className="text-xl" />
                {t("loading")}
              </>
            ) : (
              <>
                <Icon icon="solar:login-3-line-duotone" className="text-xl" />
                {t("login")}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
