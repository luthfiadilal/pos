import apiClient from "./apiClient";

export const getTables = (unit_cd, company_cd, branch_cd) => {
  return apiClient.get("/pos/tables", {
    params: { unit_cd, company_cd, branch_cd },
  });
};
