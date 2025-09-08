import apiClient from "./apiClient";

export const getYearSales = (unit_cd, company_cd, branch_cd) => {
  return apiClient.get("/pos/sales-yearly", {
    params: { unit_cd, company_cd, branch_cd },
  });
};
