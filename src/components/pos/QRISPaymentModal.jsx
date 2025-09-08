import React from "react";
import QRCode from "react-qr-code";

const qrisOptions = [
  { value: "ovo", image: "/images/qr/ovo.png" },
  { value: "dana",  image: "/images/qr/dana.png" },
  { value: "gopay", image: "/images/qr/gopay.png" },
  { value: "shopeepay", image: "/images/qr/shopeePay.png" },
  { value: "linkaja", image: "/images/qr/LinkAja.png" },
  { value: "rekening",  image: "/images/qr/RekeningBank.png" },
];


export default function QRISPaymentModal({
  totalAmount,
  selectedQRIS,
  setSelectedQRIS,
  handlePrintReceipt,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-sm p-6 text-center">
        <h3 className="text-lg font-bold mb-4 text-purple-700">
          Pembayaran QRIS
        </h3>

        <p className="mb-4 text-gray-700">
          Total: <strong>Rp {totalAmount.toLocaleString()}</strong>
        </p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {qrisOptions.map((option) => (
            <button
              key={option.value}
              className={`border rounded-lg p-2 hover:border-purple-500 ${
                selectedQRIS === option.value ? "border-purple-600 ring-2 ring-purple-300" : ""
              }`}
              onClick={() => setSelectedQRIS(option.value)}
            >
              <img
                src={option.image}
                style={{ width: 60, height: 50 }}
                className="mx-auto"
              />
              <p className="text-xs mt-1">{option.label}</p>
            </button>
          ))}
        </div>

        {selectedQRIS && (
          <div className="flex justify-center my-4">
            <QRCode
              value={`qris://pay?via=${selectedQRIS}&amount=${totalAmount}`}
              size={160}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>
        )}

        <button
          onClick={() => handlePrintReceipt("qris")}
          className="bg-green-600 hover:bg-purple-700 text-white px-4 py-2 rounded w-full"
        >
          Cetak Struk
        </button>
      </div>
    </div>
  );
}
