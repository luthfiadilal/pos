import React from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

// Helper functions (bisa diimpor dari file utilitas jika ada)
const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
};

export default function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
}) {
  const { t, i18n } = useTranslation();

  const parseApiDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString.length < 14) {
      return { date: "N/A", time: "N/A" };
    }
    const year = dateTimeString.substring(0, 4);
    const month = dateTimeString.substring(4, 6);
    const day = dateTimeString.substring(6, 8);
    const hour = dateTimeString.substring(8, 10);
    const minute = dateTimeString.substring(10, 12);
    const dateObj = new Date(year, month - 1, day);
    const formattedDate = dateObj.toLocaleDateString(i18n.language, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return {
      date: formattedDate,
      time: `${hour}:${minute}`,
    };
  };

  if (!isOpen || !transaction) return null;

  const { date, time } = parseApiDateTime(transaction.trans_date);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {t("transactionDetail")}
            </h3>
            <p className="text-sm text-gray-500">{transaction.slip_no}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100"
          >
            <Icon icon="mdi:close" className="h-6 w-6" />
          </button>
        </div>

        {/* Info Transaksi */}
        <div className="grid grid-cols-2 gap-4 my-4 text-sm">
          <div className="text-gray-600">
            <p>
              <span className="font-semibold">{t("dateLabel")}:</span> {date}
            </p>
            <p>
              <span className="font-semibold">{t("timeLabel")}:</span> {time}
            </p>
            <div className="flex justify-between text-sm text-gray-600">
              <span className="font-semibold">Metode Pembayaran:</span>
              {/* Gunakan optional chaining (?.) untuk keamanan jika data tidak ada */}
              <span className="font-semibold">
                {transaction.paymentMethod?.payment_nm || "N/A"}
              </span>
            </div>
          </div>
          <div className="text-gray-600 text-right">
            <p>
              <span className="font-semibold">{t("cashierLabel")}:</span>{" "}
              {transaction.teller_cd}
            </p>
            <p>
              <span className="font-semibold">{t("guestCountLabel")}:</span>{" "}
              {transaction.guests_cnt || "-"}
            </p>
          </div>
        </div>

        {/* Daftar Item */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">{t("orderDetails")}</h4>
          {transaction.details.map((item, index) => {
            const itemTotal = item.sales_qty * item.unit_price_amnt;

            // Mengelompokkan topping
            const toppingSummary = (item.toppings || []).reduce(
              (acc, topping) => {
                const name = topping.topping_nm;
                if (!acc[name]) {
                  acc[name] = {
                    count: 0,
                    price: topping.sales_price, // Simpan harga satuannya
                  };
                }
                acc[name].count += 1; // Tambah jumlahnya
                return acc;
              },
              {}
            );

            return (
              <div key={index} className="pb-2 border-b border-dashed">
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-gray-800">
                    <p>{item.product_nm}</p>
                    <p className="text-xs text-gray-500 font-normal">
                      {item.sales_qty} x {formatCurrency(item.unit_price_amnt)}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    {formatCurrency(itemTotal)}
                  </p>
                </div>
                {Object.keys(toppingSummary).length > 0 && (
                  <ul className="pl-5 mt-2 text-xs text-gray-600 space-y-1">
                    {Object.entries(toppingSummary).map(([name, details]) => (
                      <li key={name} className="flex justify-between">
                        <span>
                          + {name} (x{details.count})
                        </span>
                        ={" "}
                        <span>
                          {formatCurrency(details.count * details.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        {/* Rincian Pembayaran */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-semibold text-gray-800 mb-2">
            {t("paymentDetails")}
          </h4>
          <div className="space-y-1 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>{t("subtotal")}</span>
              <span>{formatCurrency(transaction.sales_amnt)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t("discount")}</span>
              <span>- {formatCurrency(transaction.disc_total_amnt)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                {t("tax")} ({formatCurrency(transaction.tax_base_amnt)})
              </span>
              <span>+ {formatCurrency(transaction.tax_amnt)}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-gray-900 mt-2 pt-2 border-t">
              <span>{t("grandTotal")}</span>
              <span>{formatCurrency(transaction.total_amnt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
