import apiClient from "./apiClient";

/**
 * Memeriksa apakah Start of Day (SOD) sudah ada untuk kasir pada hari ini.
 * @param {string} cashier_id - ID dari kasir yang login.
 * @param {string} date - Tanggal hari ini dalam format YYYY-MM-DD.
 * @returns {Promise<object>} Respons dari API, contoh: { exists: true }.
 */
export const checkExistingSOD = (cashier_id, date) => {
  return apiClient.get("/pos/cashdraw/check", {
    params: {
      cashier_id,
      date,
    },
  });
};

/**
 * Menyimpan data Start of Day (SOD) baru.
 * @param {object} payload - Data lengkap SOD yang akan disimpan.
 * @returns {Promise<object>} Respons dari API setelah data disimpan.
 */
export const saveSOD = (payload) => {
  return apiClient.post("/pos/cashdraw", payload);
};
