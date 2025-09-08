import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const GuestCounter = ({ label, icon, value, onValueChange }) => {
  const handleDecrement = () => {
    if (value > 0) {
      onValueChange(value - 1);
    }
  };

  const handleIncrement = () => {
    onValueChange(value + 1);
  };

  return (
    <div>
      <label className="flex items-center text-sm font-medium text-gray-600 mb-2">
        <Icon icon={icon} className="mr-2 h-5 w-5 text-gray-400" />
        {label}
      </label>
      <div className="flex items-center justify-between rounded-lg border border-gray-300 p-2">
        <button
          type="button"
          onClick={handleDecrement}
          className="p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={value <= 0}
        >
          <Icon icon="ic:round-minus" className="h-5 w-5" />
        </button>
        <span className="w-12 text-center text-lg font-semibold text-gray-800">
          {value}
        </span>
        <button
          type="button"
          onClick={handleIncrement}
          className="p-1 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Icon icon="ic:round-plus" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default function GuestInputModal({
  isOpen,
  onClose,
  onConfirm,
  table,
  bizType,
}) {
  const { t } = useTranslation();
  const [orderName, setOrderName] = useState("");
  const [menCount, setMenCount] = useState(1);
  const [womenCount, setWomenCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (bizType === "10002" && table) {
        setOrderName(`Meja ${table.tbl_cd}`);
      } else {
        setOrderName("");
      }
      setMenCount(1);
      setWomenCount(0);
      setError("");
    }
  }, [isOpen, table, bizType]);

  const totalGuests = Number(menCount) + Number(womenCount);

  const handleConfirmClick = () => {
    if (!orderName.trim()) {
      setError(t("errorOrderNameEmpty"));
      return;
    }
    if (totalGuests <= 0) {
      setError(t("errorGuestCountZero"));
      return;
    }
    setError("");
    onConfirm({
      name: orderName,
      total: totalGuests,
      men: Number(menCount),
      women: Number(womenCount),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
          >
            {/* Header dengan Tombol Close */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {bizType === "10002"
                  ? t("tableDetails", { tableId: table.tbl_cd })
                  : t("orderDetails")}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <Icon icon="mdi:close" className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Input Nama Pesanan dengan Ikon */}
              <div>
                <label
                  htmlFor="orderName"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  {t("orderName")}
                </label>
                <div className="relative">
                  <Icon
                    icon="mdi:account-edit-outline"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                  />
                  <input
                    id="orderName"
                    type="text"
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    placeholder={t("orderNamePlaceholder")}
                    className="pl-10 pr-3 py-2 block w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Counter Tamu */}
              <div className="grid grid-cols-2 gap-4">
                <GuestCounter
                  label={t("menCount")}
                  icon="mdi:gender-male"
                  value={menCount}
                  onValueChange={setMenCount}
                />
                <GuestCounter
                  label={t("womenCount")}
                  icon="mdi:gender-female"
                  value={womenCount}
                  onValueChange={setWomenCount}
                />
              </div>

              <hr className="my-4 border-gray-100" />

              {/* Total Tamu */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-base font-semibold text-gray-700">
                  <Icon
                    icon="mdi:account-group"
                    className="mr-2 h-6 w-6 text-blue-500"
                  />
                  {t("totalGuests")}
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {totalGuests}
                </p>
              </div>

              {/* Pesan Error */}
              {error && (
                <div className="flex items-center bg-red-50 text-red-700 text-sm p-3 rounded-lg mt-2">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    className="h-5 w-5 mr-2"
                  />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Tombol Aksi */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleConfirmClick}
                className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center justify-center gap-2"
              >
                {t("confirmAndProceed")}
                <Icon icon="mdi:arrow-right" className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
