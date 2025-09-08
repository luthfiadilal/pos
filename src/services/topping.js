import apiClient from "./apiClient"; // Pastikan path ini sesuai dengan struktur proyek Anda

/**
 * Mengambil data master topping beserta harganya
 * @param {string} unit_cd
 * @param {string} company_cd
 * @param {string} branch_cd
 * @returns {Promise<Array>}
 */
export const getToppings = (unit_cd, company_cd, branch_cd) => {
  return apiClient.get("/pos/toppings", {
    params: {
      unit_cd,
      company_cd,
      branch_cd,
    },
  });
};
