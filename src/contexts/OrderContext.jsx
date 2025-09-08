import React, { createContext, useState, useContext, useEffect } from "react";

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  // State untuk sesi yang SUDAH TERSIMPAN di API (kartu merah di /table)
  const [activeSessions, setActiveSessions] = useState(() => {
    try {
      const saved = localStorage.getItem("activeSessions");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Gagal memuat sesi aktif dari localStorage", error);
      return [];
    }
  });

  // BARU: State untuk order yang SEDANG DIPROSES (sementara, tidak persisten)
  const [draftOrder, setDraftOrder] = useState(null);

  useEffect(() => {
    localStorage.setItem("activeSessions", JSON.stringify(activeSessions));
  }, [activeSessions]);

  // BARU: Fungsi untuk memulai draft order (dipanggil dari /table)
  // Menyimpan info meja dan tamu sementara sebelum masuk ke /pos
  const startDraftOrder = (tableData, guestDetails) => {
    setDraftOrder({
      table: tableData,
      guests: guestDetails, // { name, men, women, total }
    });
  };

  // BARU: Fungsi untuk membersihkan draft order setelah selesai
  const clearDraftOrder = () => {
    setDraftOrder(null);
  };

  /**
   * DIUBAH: Fungsi ini sekarang tugasnya MENYIMPAN sesi yang sudah berhasil dibuat di API
   * ke dalam daftar sesi aktif.
   * @param {object} sessionData - Berisi { table, guests, posOrderNo }
   */
  const saveSession = (sessionData) => {
    const newSession = {
      ...sessionData,
      startTime: new Date().toISOString(),
    };
    setActiveSessions((prevSessions) => [...prevSessions, newSession]);
  };

  const endTableSession = (tableId) => {
    setActiveSessions((prevSessions) =>
      prevSessions.filter((session) => session.table.tbl_cd !== tableId)
    );
  };

  const resetAllSessions = () => {
    setActiveSessions([]);
  };

  const value = {
    activeSessions,
    saveSession,
    endTableSession,
    resetAllSessions,
    draftOrder,
    startDraftOrder,
    clearDraftOrder,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};
