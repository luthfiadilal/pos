import apiClient from "./apiClient";

export const getProducts = (unit_cd, company_cd, branch_cd) => {
  return apiClient.get("/pos/products", {
    params: { unit_cd, company_cd, branch_cd },
  });
};
