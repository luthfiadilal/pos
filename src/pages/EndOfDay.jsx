import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

export default function EndOfDay() {
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [usePayment, setUsePayment] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedOpening = localStorage.getItem("openingBalance");
    const storedUsePayment = localStorage.getItem("usePayment");

    if (storedOpening) setOpeningBalance(storedOpening);
    if (storedUsePayment !== null) setUsePayment(storedUsePayment === "true");
  }, []);

  const handleSubmit = () => {
    if (!closingBalance || parseInt(closingBalance) <= 0) {
      alert("Masukkan saldo akhir yang valid.");
      return;
    }

    // Simpan laporan End of Day (opsional: kirim ke backend)
    console.log("Laporan End of Day:", {
      openingBalance,
      closingBalance,
      usePayment,
      date: new Date().toISOString(),
    });

    // Reset
    localStorage.removeItem("openingBalance");
    localStorage.removeItem("usePayment");

    alert("✅ End of Day disimpan. Sampai jumpa besok!");
    navigate("/menu");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold text-blue-700 mb-4">End of Day</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Saldo Awal (dari Start of Day)
          </label>
          <div className="bg-gray-100 p-2 rounded-lg text-gray-700">
            Rp {parseInt(openingBalance || 0).toLocaleString("id-ID")}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Saldo Akhir (Modal + Pendapatan)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">Rp</span>
            <input
              type="number"
              value={closingBalance}
              onChange={(e) => setClosingBalance(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: 500000"
              min="0"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex justify-center items-center gap-2"
        >
          <Icon icon="solar:archive-down-bold" />
          Simpan & Tutup Hari Ini
        </button>
      </div>
    </div>
  );
}
