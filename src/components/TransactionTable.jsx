// src/components/TransactionTable.jsx
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Icon } from "@iconify/react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export default function TransactionTable({ unit_cd, company_cd, branch_cd }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          "http://localhost:5000/pos/getTransactions",
          {
            params: { unit_cd, company_cd, branch_cd },
          }
        );
        setTransactions(response.data);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data transaksi");
      } finally {
        setLoading(false);
      }
    };

    if (unit_cd && company_cd && branch_cd) {
      fetchTransactions();
    }
  }, [unit_cd, company_cd, branch_cd]);

  const { totalQty, totalAmount } = useMemo(() => {
    let qty = 0;
    let amount = 0;
    transactions.forEach((trx) => {
      const status = trx.status?.trim().toLowerCase();
      if (status === "pending" || status === "success") {
        trx.product_details?.forEach((product) => {
          qty += product.qty;
        });
      }
      if (status === "success") {
        amount += trx.total_amount;
      }
    });
    return { totalQty: qty, totalAmount: amount };
  }, [transactions]);

  return (
    <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Transaction List
      </h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 sticky top-0 shadow-sm">
            <tr>
              {[
                "Bill No",
                "Product Name",
                "Quantity",
                "Product Price",
                "Toppings (Name & Price)",
                "Total Amount",
                "Status",
                "Faspay Trx ID",
                "Tanggal",
              ].map((header, idx) => (
                <th key={idx} className="p-3 font-semibold text-left">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-gray-500">
                  <Icon
                    icon="line-md:loading-loop"
                    className="inline-block text-3xl animate-spin"
                  />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan="9"
                  className="p-8 text-center text-red-500 font-medium"
                >
                  {error}
                </td>
              </tr>
            ) : transactions.length > 0 ? (
              transactions.flatMap((trx, trxIdx) =>
                trx.product_details?.map((product, idx) => (
                  <tr
                    key={`${trx.id}-${idx}`}
                    className={`${
                      (trxIdx + idx) % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors`}
                  >
                    <td className="p-3">{trx.bill_no}</td>
                    <td className="p-3 font-medium text-gray-800">
                      {product.name}
                    </td>
                    <td className="p-3 text-center">{product.qty}</td>
                    <td className="p-3">{formatCurrency(product.price)}</td>
                    <td className="p-3">
                      {product.toppings?.length > 0 ? (
                        <ul className="list-disc ml-4 text-xs text-gray-600 space-y-1">
                          {product.toppings.map((topping, tIdx) => (
                            <li key={tIdx}>
                              {topping.name} ({formatCurrency(topping.price)})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-gray-900">
                      {formatCurrency(trx.total_amount)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border
                          ${
                            trx.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                              : trx.status === "success"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : trx.status === "failed"
                              ? "bg-red-100 text-red-800 border-red-300"
                              : "bg-gray-100 text-gray-800 border-gray-300"
                          }`}
                      >
                        {trx.status}
                      </span>
                    </td>
                    <td className="p-3">{trx.faspay_trx_id || "-"}</td>
                    <td className="p-3">
                      {new Date(trx.created_at).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan="9" className="p-8 text-center text-gray-500">
                  No transactions found for the selected date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-6 flex flex-col md:flex-row justify-between md:justify-end items-center gap-4 md:gap-8 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
        <div className="font-bold text-gray-800">
          Total QTY: <span className="text-blue-600">{totalQty}</span>
        </div>
        <div className="font-bold text-gray-800">
          Total Amount:{" "}
          <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
