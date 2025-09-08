import apiClient from "./apiClient";

export const getTableCategories = (unit_cd, company_cd, branch_cd) => {
  return apiClient.get("/pos/table-cates", {
    params: { unit_cd, company_cd, branch_cd },
  });
};
