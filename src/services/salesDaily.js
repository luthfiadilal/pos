import apiClient from "./apiClient";

export const getDailySales = (unit_cd, company_cd, branch_cd) => {
  return apiClient.get("/pos/sales-daily", {
    params: { unit_cd, company_cd, branch_cd },
  });
};
