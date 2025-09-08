import React from "react";

export default function DebitCreditPaymentModal({
  totalAmount,
  selectedBank,
  setSelectedBank,
  pin,
  setPin,
  handlePrintReceipt,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-sm p-6 text-center">
        <h3 className="text-lg font-bold mb-4 text-yellow-700">
          Pembayaran Debit/Kredit
        </h3>
        <p className="mb-2 text-gray-700">
          Total: <strong>Rp {totalAmount.toLocaleString()}</strong>
        </p>
        <select
          className="w-full border px-3 py-2 rounded mb-3"
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
        >
          <option value="">Pilih Bank</option>
          <option value="bca">BCA</option>
          <option value="mandiri">Mandiri</option>
          <option value="bni">BNI</option>
          <option value="bri">BRI</option>
        </select>
        <input
          type="password"
          placeholder="PIN"
          className="w-full border px-3 py-2 rounded mb-4"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <button
          onClick={() => handlePrintReceipt("debit")}
          className="bg-green-600 hover:bg-yellow-700 text-white px-4 py-2 rounded w-full"
        >
          Cetak Struk
        </button>
      </div>
    </div>
  );
}
