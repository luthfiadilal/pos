import apiClient from "./apiClient";

export const login = (user_id, user_password) => {
  return apiClient.post("/syspos/login", {
    user_id,
    user_password,
  });
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
