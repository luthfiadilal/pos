import apiClient from "./apiClient";

/**
 * Mengirim data order baru ke server.
 * @param {object} orderPayload - Payload lengkap sesuai spesifikasi API /pos/orders.
 * @returns {Promise<object>} Respons dari API.
 */
export const createOrder = (orderPayload) => {
  return apiClient.post("/pos/orders", orderPayload);
};

/**
 * Mengirim data pembayaran ke server.
 * @param {object} paymentPayload - Payload lengkap sesuai spesifikasi API /pos/pay.
 * @returns {Promise<object>} Respons dari API.
 */
export const processPayment = (paymentPayload) => {
  return apiClient.post("/pos/pay", paymentPayload);
};

/**
 * Mengambil detail lengkap dari satu order yang sudah ada.
 */
export const getOrderDetails = (posOrderNo, unit_cd, company_cd, branch_cd) => {
  return apiClient.get("/pos/orders-detail", {
    params: {
      pos_order_no: posOrderNo,
      unit_cd,
      company_cd,
      branch_cd,
    },
  });
};

/**
 * Mendaftarkan member baru
 */
export const registerMember = (memberPayload) => {
  return apiClient.post("/pos/regist-member", memberPayload);
};

/**
 * Mengambil data member berdasarkan nomor HP
 */
export const getMember = (unit_cd, company_cd, branch_cd, mobile_phone_no) => {
  return apiClient.get("/pos/member", {
    params: {
      unit_cd,
      company_cd,
      branch_cd,
      mobile_phone_no,
    },
  });
};
