import React, { useState } from "react";
// import { saveCashTransaction } from "../../services/cashTransaction";

export default function CashPaymentModal({
  totalAmount,
  onClose,
  onSubmit, // Fungsi dari parent untuk handle submit
  isLoading, // Status loading dari parent
}) {
  const [cashReceived, setCashReceived] = useState("");
  const [isError, setIsError] = useState(false);

  // Fungsi format Rupiah tetap sama
  const formatRupiah = (value) => {
    const numberString = value.replace(/[^,\d]/g, "").toString();
    const split = numberString.split(",");
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/g);

    if (ribuan) rupiah += (sisa ? "." : "") + ribuan.join(".");

    return split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
  };

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/\./g, "");
    // Hanya izinkan angka
    if (isNaN(rawValue)) return;

    const formatted = formatRupiah(rawValue);
    setCashReceived(formatted);

    const numericValue = Number(rawValue.replace(/,/g, "") || 0);
    setIsError(numericValue < totalAmount);
  };

  const numericCash = Number(
    cashReceived.replace(/\./g, "").replace(/,/g, "") || 0
  );
  const change = numericCash - totalAmount;

  // Sederhanakan handleSubmit
  const handleSubmit = () => {
    // Validasi dasar
    if (isError || !cashReceived || isLoading) {
      return;
    }
    // Panggil fungsi onSubmit dari props dengan membawa data uang diterima
    onSubmit({ cashReceived: numericCash });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {/* Tambahkan onClick={onClose} untuk menutup modal saat klik di luar area */}
      <div className="fixed inset-0" onClick={onClose}></div>
      <div
        className="bg-white rounded-lg w-full max-w-sm p-6 text-center relative z-10"
        onClick={(e) => e.stopPropagation()} // Mencegah penutupan saat klik di dalam modal
      >
        <h3 className="text-lg font-bold mb-4 text-green-700">
          Pembayaran Cash
        </h3>
        <p className="mb-2 text-gray-700">
          Total Bayar: <strong>Rp {totalAmount.toLocaleString()}</strong>
        </p>

        <input
          type="text"
          placeholder="Uang Diterima"
          className={`border w-full px-4 py-2 rounded mb-2 text-center text-xl ${
            isError ? "border-red-500" : "border-gray-300"
          }`}
          value={cashReceived}
          onChange={handleChange}
          autoFocus // Fokus otomatis ke input
        />

        {isError && (
          <p className="text-sm text-red-500 mb-2">
            Uang yang diterima kurang dari total.
          </p>
        )}

        <p className="text-lg text-gray-600 mb-4">
          Kembalian:{" "}
          <strong className={change >= 0 ? "text-blue-600" : "text-red-600"}>
            Rp {change >= 0 ? change.toLocaleString() : "0"}
          </strong>
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded w-full text-white font-semibold ${
              isError || !cashReceived || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={isError || !cashReceived || isLoading}
          >
            {isLoading ? "Menyimpan..." : "Simpan & Cetak Struk"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded w-full text-gray-700 bg-gray-200 hover:bg-gray-300"
            disabled={isLoading}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
