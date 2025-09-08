import { useState } from "react";
import { Icon } from "@iconify/react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext"; // Pastikan path ini benar
import Swal from "sweetalert2";

// --- Helper Functions ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (dateString) => {
  if (!dateString || dateString.length < 8) return "N/A";
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  const hours = dateString.substring(8, 10) || "00";
  const minutes = dateString.substring(10, 12) || "00";
  return new Date(year, month - 1, day, hours, minutes).toLocaleString(
    "id-ID",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

// --- Main Component ---
export default function ClosingPOS() {
  // --- STATE MANAGEMENT ---
  const [view, setView] = useState("initial"); // 'initial', 'form', 'result'
  const [salesData, setSalesData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [finalClosingData, setFinalClosingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const token = localStorage.getItem("token");

  // --- 1. Fungsi untuk memulai proses, dipanggil oleh tombol awal ---
  const handleStartProcess = async () => {
    if (!user || !token) {
      Swal.fire("Error", "Sesi tidak valid, silakan login kembali.", "error");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const commonParams = {
        unit_cd: user.unit_cd,
        company_cd: user.company_cd,
        branch_cd: user.branch_cd,
      };
      const headers = { Authorization: `Bearer ${token}` };

      // Menjalankan GET /sales-daily dan GET /session secara bersamaan
      const [salesRes, sessionRes] = await Promise.all([
        axios.get("http://localhost:3000/pos/sales-daily", {
          params: commonParams,
          headers,
        }),
        // Memanggil API /session dengan parameter 'date'
        axios.get("http://localhost:3000/pos/session", {
          params: {
            ...commonParams,
            date: getTodayDateString(),
            teller_cd: "101", // Ganti dengan user.id_user jika sudah dinamis
          },
          headers,
        }),
      ]);

      if (!sessionRes.data?.data) {
        throw new Error(
          "Tidak ada sesi kasir aktif yang ditemukan untuk Anda hari ini. Silakan mulai sesi baru."
        );
      }

      setSalesData(salesRes.data?.data?.[0] || {});
      setSessionData(sessionRes.data.data);
      setView("form");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Gagal memuat data awal.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Fungsi untuk submit closing, dipanggil dari form ---
  const handleClosingProcess = async (counted_end_amount) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const commonParams = {
        unit_cd: user.unit_cd,
        company_cd: user.company_cd,
        branch_cd: user.branch_cd,
      };

      await axios.put(
        "http://localhost:3000/pos/close",
        {
          ...commonParams,
          trans_no: sessionData.trans_no,
          counted_end_amount: parseFloat(counted_end_amount),
        },
        { headers }
      );

      const [closingRes, salesRes] = await Promise.all([
        axios.get("http://localhost:3000/pos/close-data", {
          params: { ...commonParams, date: getTodayDateString() },
          headers,
        }),
        axios.get("http://localhost:3000/pos/sales-daily", {
          params: commonParams,
          headers,
        }),
      ]);

      const newClosingData = closingRes.data.data.find(
        (d) => d.trans_no === sessionData.trans_no
      );
      if (!newClosingData)
        throw new Error("Gagal mengambil data laporan closing final.");

      setFinalClosingData(newClosingData);
      setSalesData(salesRes.data?.data?.[0] || {});
      setView("result");
      Swal.fire("Berhasil!", "Sesi kasir telah berhasil ditutup.", "success");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Terjadi kesalahan saat proses closing.";
      Swal.fire("Gagal!", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER LOGIC ---
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <Icon
            icon="line-md:loading-loop"
            className="text-4xl text-blue-600"
          />
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-screen text-red-500 font-medium text-center p-5">
          <p>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setView("initial");
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Kembali
          </button>
        </div>
      );
    }

    switch (view) {
      case "form":
        return (
          <ClosingForm
            salesData={salesData}
            sessionData={sessionData}
            user={user}
            onSubmit={handleClosingProcess}
            isSubmitting={isSubmitting}
          />
        );
      case "result":
        return (
          <ClosingResult
            closingData={finalClosingData}
            salesData={salesData}
            user={user}
          />
        );
      case "initial":
      default:
        return (
          <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
            <Icon
              icon="solar:login-3-bold-duotone"
              className="text-7xl text-blue-500 mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-700 mb-2">
              Halaman Closing Kasir
            </h1>
            <p className="text-gray-500 mb-6">
              Klik tombol di bawah untuk memulai proses closing sesi Anda.
            </p>
            <button
              onClick={handleStartProcess}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md flex items-center gap-2"
            >
              <Icon icon="solar:play-circle-bold" className="text-xl" />
              Mulai Proses Closing
            </button>
          </div>
        );
    }
  };

  return <div className="w-full min-h-screen">{renderContent()}</div>;
}

// --- Sub-component untuk Form Closing ---
const ClosingForm = ({
  salesData,
  sessionData,
  user,
  onSubmit,
  isSubmitting,
}) => {
  const openingBalance = parseFloat(sessionData.begin_amnt) || 0;
  const totalSales = parseFloat(salesData.sales_amnt) || 0;
  const expectedClosing = openingBalance + totalSales;

  const triggerSubmit = async () => {
    const { value: counted_end_amount } = await Swal.fire({
      title: "Konfirmasi Closing",
      input: "number",
      inputLabel: "Masukkan jumlah uang fisik yang dihitung di laci kas",
      inputPlaceholder: "Contoh: 5500000",
      showCancelButton: true,
      confirmButtonText: "Lanjutkan & Tutup Sesi",
      cancelButtonText: "Batal",
      inputValidator: (value) =>
        !value || value < 0 ? "Anda perlu memasukkan jumlah yang valid!" : null,
    });
    if (counted_end_amount) {
      onSubmit(counted_end_amount);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="p-6 md:p-10 max-w-4xl mx-auto bg-white shadow-lg rounded-xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          Closing Sesi Kasir
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-5 shadow-inner">
            <h2 className="font-semibold text-lg mb-4 text-gray-700">
              Informasi Sesi
            </h2>
            <div className="text-sm space-y-3">
              <p>
                <strong>ID Sesi:</strong> {sessionData.trans_no}
              </p>
              <p>
                <strong>Kasir:</strong> {user?.name || "N/A"}
              </p>
              <p>
                <strong>Waktu Mulai:</strong>{" "}
                {formatDate(sessionData.trans_date)}
              </p>
              <p>
                <strong>Saldo Awal:</strong> {formatCurrency(openingBalance)}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-5 shadow-inner">
            <h2 className="font-semibold text-lg mb-4 text-gray-700">
              Ringkasan Penjualan
            </h2>
            <div className="text-sm space-y-3">
              <p>
                <strong>Tunai:</strong>{" "}
                {formatCurrency(salesData.pay_cash_amnt)}
              </p>
              <p>
                <strong>E-Wallet:</strong>{" "}
                {formatCurrency(salesData.pay_ewallet_amnt)}
              </p>
              <p>
                <strong>Debit/Kredit:</strong>{" "}
                {formatCurrency(
                  (salesData.pay_debit_amnt || 0) +
                    (salesData.pay_credit_amnt || 0)
                )}
              </p>
              <p className="font-bold text-blue-600 border-t pt-3 mt-2">
                Total Penjualan: {formatCurrency(totalSales)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8 text-center">
          <h2 className="font-semibold text-md text-blue-800 mb-2">
            Estimasi Saldo Akhir Sistem
          </h2>
          <p className="text-2xl font-bold text-blue-700">
            {formatCurrency(expectedClosing)}
          </p>
        </div>
        <div className="text-center">
          <button
            onClick={triggerSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            <Icon
              icon={
                isSubmitting
                  ? "line-md:loading-twotone-loop"
                  : "solar:check-circle-bold"
              }
              className="text-xl"
            />
            {isSubmitting ? "Memproses..." : "Konfirmasi & Lanjutkan Closing"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-component untuk Menampilkan Hasil Closing ---
const ClosingResult = ({ closingData, salesData, user }) => {
  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="p-6 md:p-10 max-w-4xl mx-auto bg-white shadow-lg rounded-xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-green-700">
          Laporan Closing
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Sesi kasir telah berhasil ditutup.
        </p>
        <div className="border rounded-lg p-5 mb-6">
          <h2 className="font-semibold text-lg mb-4 text-gray-800">
            Rincian Keuangan Sesi
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Saldo Awal</span>
              <span className="font-medium">
                {formatCurrency(closingData.begin_amnt)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Pemasukan (Sistem)</span>
              <span className="font-medium text-green-600">
                + {formatCurrency(closingData.rcv_amnt)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-gray-600">Total Pengeluaran</span>
              <span className="font-medium text-red-600">
                - {formatCurrency(closingData.paid_out_amnt)}
              </span>
            </div>
            <div className="flex justify-between items-center font-bold">
              <span>Saldo Akhir (Sistem)</span>
              <span>
                {formatCurrency(
                  parseFloat(closingData.begin_amnt) +
                    parseFloat(closingData.rcv_amnt)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center font-bold">
              <span>Saldo Akhir (Fisik Dihitung)</span>
              {/* [PERBAIKAN] Gunakan `ending_amnt` dan akses langsung dari `closingData` */}
              <span>{formatCurrency(closingData.ending_amnt)}</span>
            </div>
            <div
              className={`flex justify-between items-center text-lg font-bold p-3 rounded-lg ${
                closingData.variance == 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              <span>SELISIH</span>
              {/* [PERBAIKAN] Akses `variance` langsung dari `closingData` */}
              <span>{formatCurrency(closingData.variance)}</span>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-5 shadow-inner">
          <h2 className="font-semibold text-lg mb-4 text-gray-700">
            Ringkasan Penjualan Selama Sesi
          </h2>
          <div className="text-sm space-y-3">
            <p>
              <strong>Tunai:</strong> {formatCurrency(salesData.pay_cash_amnt)}
            </p>
            <p>
              <strong>E-Wallet:</strong>{" "}
              {formatCurrency(salesData.pay_ewallet_amnt)}
            </p>
            <p>
              <strong>Debit/Kredit:</strong>{" "}
              {formatCurrency(
                (salesData.pay_debit_amnt || 0) +
                  (salesData.pay_credit_amnt || 0)
              )}
            </p>
            <p className="font-bold text-blue-600 border-t pt-3 mt-2">
              Total Penjualan: {formatCurrency(salesData.sales_amnt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
