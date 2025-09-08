import apiClient from "./apiClient";

export const saveCashTransaction = (cashData) => {
  return apiClient.post("/pos/cash-payment", cashData);
};
