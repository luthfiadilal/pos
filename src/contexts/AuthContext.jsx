import { createContext, useContext, useState, useEffect } from "react";
import {
  login as loginRequest,
  logout as logoutRequest,
} from "../services/auth";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [bizType, setBizType] = useState(() => {
    return localStorage.getItem("bizType") || null;
  });

  const login = async (username, password) => {
    const res = await loginRequest(username, password);

    // Ambil biz_type dari respons
    const userBizType = res.data.compBizType.comp_biz_type;

    // Simpan data ke localStorage
    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.data));
    localStorage.setItem("bizType", userBizType);

    // Set state
    setUser(res.data);
    setBizType(userBizType);

    return res;
  };

  const logout = () => {
    logoutRequest();
    setUser(null);
    setBizType(null);
    localStorage.removeItem("bizType");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, bizType, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
