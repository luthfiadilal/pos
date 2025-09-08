import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { getOrderHistory } from "../services/payment";
import TransactionDetailModal from "../components/TransactionDetailModal";

// Helper functions (tidak ada perubahan)
const formatCurrency = (value) => {
  return new Intl.NumberFormat({
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

const parseApiDateTime = (dateTimeString) => {
  if (!dateTimeString || dateTimeString.length < 14) {
    return { date: "N/A", time: "N/A" };
  }
  const year = dateTimeString.substring(0, 4);
  const month = dateTimeString.substring(4, 6);
  const day = dateTimeString.substring(6, 8);
  const hour = dateTimeString.substring(8, 10);
  const minute = dateTimeString.substring(10, 12);

  return {
    date: `${year}-${month}-${day}`, // Format YYYY-MM-DD
    time: `${hour}:${minute}`, // Format HH:MM
  };
};

const OrderOfflineOverview = () => {
  const { t, i18n } = useTranslation();
  // --- STATE MANAGEMENT ---
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // --- FILTER STATE --- (Tidak ada perubahan)
  const currentDate = new Date();
  const [filters, setFilters] = useState({
    day: String(currentDate.getDate()).padStart(2, "0"),
    month: String(currentDate.getMonth() + 1).padStart(2, "0"),
    year: currentDate.getFullYear().toString(),
  });

  // --- DATA FETCHING (DIPERBAIKI) ---
  useEffect(() => {
    if (user) {
      const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
          const responseData = await getOrderHistory(
            user.unit_cd,
            user.company_cd,
            user.branch_cd
          );

          if (!Array.isArray(responseData)) {
            console.warn("Response bukan array:", responseData);
            setAllTransactions([]);
            return;
          }

          const paidTransactions = responseData.filter(
            (transaction) => transaction.orderHeader?.is_paid === 1
          );

          // Lanjutkan dengan .map() pada data yang sudah difilter
          const formattedTransactions = paidTransactions.map((transaction) => {
            const { time } = parseApiDateTime(transaction.trans_date);
            return {
              ...transaction,
              // Tambah properti `time` untuk kemudahan sorting/display
              time: time,
            };
          });

          setAllTransactions(formattedTransactions);
        } catch (err) {
          console.error("Failed to fetch transactions:", err);
          setError(t("errorFetchTransactions"));
        } finally {
          setLoading(false);
        }
      };

      fetchTransactions();
    } else {
      setLoading(false);
      setError(t("errorUserDataNotAvailable"));
    }
  }, [user, t]);

  // --- FILTERING LOGIC (DIPERBAIKI) ---
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      if (!transaction.trans_date) return false;

      const { date } = parseApiDateTime(transaction.trans_date);
      if (date === "N/A") return false;

      const orderDate = new Date(date);
      const orderYear = orderDate.getFullYear().toString();
      const orderMonth = String(orderDate.getMonth() + 1).padStart(2, "0");
      const orderDay = String(orderDate.getDate()).padStart(2, "0");

      const matchYear = !filters.year || orderYear === filters.year;
      const matchMonth = !filters.month || orderMonth === filters.month;
      const matchDay = !filters.day || orderDay === filters.day;

      return matchYear && matchMonth && matchDay;
    });
  }, [allTransactions, filters]);

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // jumlah data per halaman

  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredTransactions, currentPage]);

  // --- CALCULATIONS (DIPERBAIKI) ---
  const totalQty = useMemo(
    () => filteredTransactions.reduce((sum, trx) => sum + trx.sales_qty, 0),
    [filteredTransactions]
  );
  const totalAmount = useMemo(
    () => filteredTransactions.reduce((sum, trx) => sum + trx.total_amnt, 0),
    [filteredTransactions]
  );

  // --- UI HELPER FUNCTIONS & RENDER METHOD --- (Tidak ada perubahan)
  const yearOptions = Array.from(
    { length: 5 },
    (_, i) => currentDate.getFullYear() - i
  );
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: String(i + 1).padStart(2, "0"),
        name: new Date(0, i).toLocaleString(i18n.language, { month: "long" }),
      })),
    [i18n.language]
  );
  const getDayOptions = () => {
    if (!filters.month || !filters.year)
      return Array.from({ length: 31 }, (_, i) => i + 1);
    const daysInMonth = new Date(filters.year, filters.month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    if (field === "year") {
      newFilters.month = "";
      newFilters.day = "";
    }
    if (field === "month") {
      newFilters.day = "";
    }
    setFilters(newFilters);
  };

  return (
    <>
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {t("transactionHistory")}
          </h1>

          {/* Date Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 p-4 bg-gray-100 rounded-lg">
            {/* Filter controls... */}
            <div className="flex items-center gap-2">
              <label className="font-medium text-sm text-gray-600">
                {t("year")}:
              </label>
              <select
                className="bg-white border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
              >
                <option value="">{t("all")}</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium text-sm text-gray-600">
                {t("month")}:
              </label>
              <select
                className="bg-white border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.month}
                onChange={(e) => handleFilterChange("month", e.target.value)}
                disabled={!filters.year}
              >
                <option value="">{t("all")}</option>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-medium text-sm text-gray-600">
                {t("day")}:
              </label>
              <select
                className="bg-white border border-gray-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.day}
                onChange={(e) => handleFilterChange("day", e.target.value)}
                disabled={!filters.month}
              >
                <option value="">{t("all")}</option>
                {getDayOptions().map((day) => (
                  <option key={day} value={String(day).padStart(2, "0")}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() =>
                setFilters({
                  day: String(currentDate.getDate()).padStart(2, "0"),
                  month: String(currentDate.getMonth() + 1).padStart(2, "0"),
                  year: currentDate.getFullYear().toString(),
                })
              }
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              {t("today")}
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="p-3 font-semibold">{t("slipNo")}</th>
                  <th className="p-3 font-semibold">{t("time")}</th>
                  <th className="p-3 text-center font-semibold">
                    {t("totalItems")}
                  </th>
                  <th className="p-3 text-right font-semibold">
                    {t("totalPurchase")}
                  </th>
                  <th className="p-3 text-center font-semibold">
                    {t("paymentStatus")}
                  </th>
                  <th className="p-3 text-center font-semibold">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-500">
                      {t("loadingData")}
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredTransactions.length > 0 ? (
                  paginatedTransactions.map((trx) => (
                    <tr
                      key={trx.trans_no}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium text-gray-800">
                        {trx.slip_no}
                      </td>
                      <td className="p-3 text-gray-600">{trx.time}</td>
                      <td className="p-3 text-center text-gray-600">
                        {trx.sales_qty}
                      </td>
                      <td className="p-3 text-right font-semibold text-gray-800">
                        {formatCurrency(trx.total_amnt)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trx.orderHeader?.is_paid === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {trx.orderHeader?.is_paid === 1
                            ? t("paid")
                            : t("unpaid")}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedTransaction(trx)}
                          className="text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          {t("viewDetails")}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-8 text-gray-500">
                      {t("noTransactionsFound")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md border text-sm ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md border text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Totals Section tidak berubah */}
          <div className="mt-6 flex flex-col md:flex-row justify-end items-center gap-4 md:gap-8 p-4 bg-gray-100 rounded-lg">
            <div className="font-bold text-gray-800">
              {t("totalQty")}: <span className="text-blue-600">{totalQty}</span>
            </div>
            <div className="font-bold text-gray-800">
              {t("totalAmount")}:{" "}
              <span className="text-blue-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Render Modal */}
      <TransactionDetailModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </>
  );
};

export default OrderOfflineOverview;
