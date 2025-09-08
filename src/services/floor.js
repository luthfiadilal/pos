import apiClient from "./apiClient";

export const getFloors = (unit_cd, company_cd, branch_cd) => {
  return apiClient.get("/pos/floors", {
    params: { unit_cd, company_cd, branch_cd },
  });
};
