import apiClient from "./apiClient";

export const getOrderProductByMonth = (
  unit_cd,
  company_cd,
  branch_cd,
  period_yy_mm
) => {
  return apiClient.get("/pos/product-sales-by-month", {
    params: { unit_cd, company_cd, branch_cd, period_yy_mm },
  });
};
