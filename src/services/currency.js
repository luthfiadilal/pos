import apiClient from "./apiClient";

export const getCurrencyData = (unit_cd, company_cd, branch_cd) => {
  return apiClient.get("/pos/currency", {
    params: { unit_cd, company_cd, branch_cd },
  });
};
