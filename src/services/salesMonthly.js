import apiClient from "./apiClient";

export const getMonthlySales = (unit_cd, company_cd, branch_cd) => {
  return apiClient.get("/pos/sales-monthly", {
    params: { unit_cd, company_cd, branch_cd },
  });
};
