import React from "react";
import { Icon } from "@iconify/react";

export default function ReceiptModal({
  receiptMethod,
  cart,
  totalAmount,
  setShowReceipt,
  setCart,
  getToppingSummary,
  calculateItemTotalPrice,
}) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
      onClick={() => setShowReceipt(false)}
    >
      <div
        className="bg-white rounded-xl w-full max-w-sm p-6 shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowReceipt(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <Icon icon="solar:close-circle-linear" className="text-xl" />
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Struk Pembayaran
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Metode: <strong className="capitalize">{receiptMethod}</strong>
          </p>
          <hr className="mb-4" />
          <div className="text-left text-sm text-gray-700 space-y-1">
            {cart.map((item, idx) => (
              <div
                key={item.id + "-receipt-" + idx}
                className="flex justify-between"
              >
                <span>
                  {item.qty}× {item.name}
                  {item.selectedToppings &&
                    item.selectedToppings.length > 0 &&
                    ` (${getToppingSummary(item.selectedToppings)})`}
                </span>
                <span>Rp {calculateItemTotalPrice(item).toLocaleString()}</span>
              </div>
            ))}
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>Rp {totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setShowReceipt(false);
              setCart([]);
            }}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
