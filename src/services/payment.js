import apiClient from "./apiClient";

export const processPayment = (payload) => {
  return apiClient.post("/pos/payment", payload);
};

export const processCashPayment = (payload) => {
  return apiClient.post("/pos/cash-payment", payload);
};

export const getOrderHistory = (unit_cd, company_cd, branch_cd) => {
  const params = { unit_cd, company_cd, branch_cd };
  return apiClient.get("/pos/saleshdr", { params });
};
