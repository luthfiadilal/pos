import React, { useState, useMemo, useEffect } from "react";

const ToppingSelector = React.memo(
  ({ index, selectedTopping, handleToppingChange, toppingOptions }) => {
    return (
      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">
          Topping untuk Item #{index + 1}
        </label>
        <select
          value={selectedTopping}
          onChange={(e) => handleToppingChange(index, e.target.value)}
          className="w-full border rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {toppingOptions}
        </select>
      </div>
    );
  }
);

const ToppingModal = React.memo(
  ({ item, mode, onClose, onConfirmAddToCart, onSaveChanges }) => {
    // [BARU] Modal sekarang mengelola state topping-nya sendiri.
    const [selectedToppings, setSelectedToppings] = useState([]);

    // [BARU] Inisialisasi atau sinkronisasi state saat `item` berubah.
    useEffect(() => {
      setSelectedToppings(item.selectedToppings || Array(item.qty).fill(""));
    }, [item]);

    // [BARU] Handler internal untuk mengubah state topping di dalam modal.
    const handleToppingChange = (index, value) => {
      const newSelectedToppings = [...selectedToppings];
      newSelectedToppings[index] = value;
      setSelectedToppings(newSelectedToppings);

      // Jika dalam mode edit, langsung kirim perubahan ke state utama di POS.jsx.
      if (mode === "edit") {
        onSaveChanges(index, value);
      }
    };

    // [BARU] Handler untuk tombol konfirmasi utama.
    const handleConfirm = () => {
      if (mode === "add") {
        // Buat objek produk baru dengan topping yang telah dipilih di modal.
        const productToAdd = { ...item, selectedToppings };
        onConfirmAddToCart(productToAdd);
      } else {
        // Untuk mode edit, perubahan sudah disimpan. Tombol ini hanya menutup modal.
        onClose();
      }
    };

    const memoizedToppingOptions = useMemo(() => {
      return (
        <>
          <option value="">Tanpa Topping</option>
          {item.availableToppings.map((toppingOpt) => {
            const price = toppingOpt.toppingPrices?.[0]?.basic_sales_price || 0;
            return (
              <option key={toppingOpt.topping_cd} value={toppingOpt.topping_nm}>
                {toppingOpt.topping_nm}{" "}
                {toppingOpt.is_free === 1
                  ? "(Free)"
                  : `(Rp ${price.toLocaleString()})`}
              </option>
            );
          })}
        </>
      );
    }, [item.availableToppings]);

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-bold mb-4">
            Pilih Topping untuk "{item.name}"
          </h3>

          {/* Render selector berdasarkan state internal modal */}
          {selectedToppings.map((selected, tIdx) => (
            <ToppingSelector
              key={tIdx}
              index={tIdx}
              selectedTopping={selected}
              handleToppingChange={handleToppingChange}
              toppingOptions={memoizedToppingOptions}
            />
          ))}

          <div className="flex justify-end items-center mt-6 gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none transition-colors font-semibold"
            >
              {/* Teks tombol dinamis berdasarkan mode */}
              {mode === "add" ? "Tambah ke Keranjang" : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default ToppingModal;
