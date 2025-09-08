import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";

export const transformCartForCheckout = (cart) => {
  return cart.map((item) => {
    const transformedItem = {
      product_cd: item.product_cd,
      product_nm: item.name,
      price: item.price,
      quantity: item.qty,
      toppings: [],
    };

    if (Array.isArray(item.selectedToppings)) {
      item.selectedToppings.forEach((group) => {
        if (Array.isArray(group)) {
          group.forEach((name) => {
            if (!name || name === "Tanpa Topping") return;
            const topping = item.availableToppings?.find(
              (t) => t.topping_nm === name
            );
            if (topping) {
              transformedItem.toppings.push({
                topping_cd: topping.topping_cd,
                topping_nm: topping.topping_nm,
                price: topping.toppingPrices?.[0]?.basic_sales_price || 0,
              });
            }
          });
        }
      });
    }

    return transformedItem;
  });
};

const ItemToppingCard = React.memo(
  ({ index, draftToppings, handleToppingChange, toppingOptionsData }) => {
    const { t } = useTranslation();
    return (
      <div className="rounded-lg border p-3 bg-white shadow-sm">
        <p className="text-sm font-semibold text-gray-800 mb-2">
          {t("itemNumber", { number: index + 1 })}
        </p>
        <div className="space-y-2">
          {toppingOptionsData.map((option, optIdx) => {
            const key = option.topping_cd ?? `${option.topping_nm}-${optIdx}`;
            const isChecked = draftToppings.includes(option.topping_nm);
            return (
              <label
                key={key}
                className={`flex items-center gap-2 cursor-pointer ${
                  isChecked ? "text-blue-600 font-semibold" : "text-gray-800"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToppingChange(index, option.topping_nm)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span>
                  {option.topping_nm}{" "}
                  {option.price > 0
                    ? `(Rp ${option.price.toLocaleString()})`
                    : ""}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }
);

const ToppingModal = React.memo(
  ({ item, mode, onClose, onConfirmAddToCart, onSaveChanges }) => {
    const { t } = useTranslation();

    const [selectedToppings, setSelectedToppings] = useState([]); // hasil tersimpan
    const [draftToppings, setDraftToppings] = useState([]); // perubahan sementara

    // Inisialisasi state
    useEffect(() => {
      let initial = [];
      if (
        Array.isArray(item.selectedToppings) &&
        Array.isArray(item.selectedToppings[0])
      ) {
        initial = item.selectedToppings;
      } else if (Array.isArray(item.selectedToppings)) {
        initial = item.selectedToppings.map((t) => [t]);
      } else {
        // gunakan Array.from agar setiap elemen array berbeda referensi
        const qty = Number(item?.qty) || 0;
        initial = Array.from({ length: qty }, () => []);
      }
      setSelectedToppings(initial);
      setDraftToppings(initial.map((arr) => [...arr])); // clone untuk draft
    }, [item]);

    // Handle perubahan di draft
    const handleToppingChange = (index, toppingName) => {
      const current = draftToppings[index] || [];
      let updated = [...current];

      const isNone = toppingName === "Tanpa Topping";
      if (isNone) {
        updated = ["Tanpa Topping"];
      } else {
        if (updated.includes(toppingName)) {
          updated = updated.filter((t) => t !== toppingName);
        } else {
          updated = updated
            .filter((t) => t !== "Tanpa Topping")
            .concat(toppingName);
        }
      }

      if (updated.length === 0) {
        updated = [];
      }

      const next = [...draftToppings];
      next[index] = updated;
      setDraftToppings(next);
    };

    const handleConfirm = () => {
      if (mode === "add") {
        const productToAdd = { ...item, selectedToppings: draftToppings };
        onConfirmAddToCart(productToAdd);
      } else {
        setSelectedToppings(draftToppings);
        draftToppings.forEach((toppings, idx) => {
          onSaveChanges(idx, toppings);
        });
      }
      onClose();
    };

    const toppingOptionsData = useMemo(() => {
      const noneOption = {
        topping_cd: "none",
        topping_nm: "Tanpa Topping",
        is_free: true,
        price: 0,
      };
      const pricedOptions = (item.availableToppings || []).map(
        (toppingOpt) => ({
          ...toppingOpt,
          price: toppingOpt.toppingPrices?.[0]?.basic_sales_price || 0,
        })
      );
      return [noneOption, ...pricedOptions];
    }, [item.availableToppings]);

    // Gunakan selectedToppings (hasil simpan) untuk tentukan kolom
    const { leftIndices, rightIndices } = useMemo(() => {
      const left = [];
      const right = [];
      selectedToppings.forEach((arr, idx) => {
        if (Array.isArray(arr) && arr.length > 0) {
          left.push(idx);
        } else {
          right.push(idx);
        }
      });
      return { leftIndices: left, rightIndices: right };
    }, [selectedToppings]);

    // ====== LOGIKA TAMPILAN GRID ======
    const itemCount = selectedToppings.length || Number(item?.qty) || 0;
    const showTwoColumns = itemCount > 1; // jika cuma 1 item => single column
    const modalWidthClass = showTwoColumns ? "max-w-4xl" : "max-w-md";
    const gridColsClass = showTwoColumns
      ? "grid grid-cols-1 md:grid-cols-2 gap-6"
      : "grid grid-cols-1 gap-6";

    const scrollThreshold = 4;
    const needsScrolling = (item.qty || 0) > scrollThreshold;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className={`bg-white rounded-xl w-full ${modalWidthClass} p-6 flex flex-col shadow-xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-shrink-0 border-b pb-4 mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              {t("selectToppings")}
            </h3>
            <p className="text-sm text-gray-500">
              {t("for")}
              <span className="font-semibold text-gray-700">"{item.name}"</span>
            </p>
          </div>

          <div
            className={`flex-grow ${
              needsScrolling ? "overflow-y-auto max-h-[60vh] pr-2" : ""
            }`}
          >
            <div className={gridColsClass}>
              {/* Kiri */}
              <div>
                {showTwoColumns && (
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    {t("selected")}
                  </p>
                )}
                {
                  !showTwoColumns &&
                    null /* single column: sembunyikan header */
                }
                {leftIndices.length === 0 && (
                  <p className="text-xs text-gray-400 italic">
                    {t("noItemsSelected")}
                  </p>
                )}
                <div className="space-y-4">
                  {leftIndices.map((idx) => (
                    <ItemToppingCard
                      key={`left-${idx}`}
                      index={idx}
                      draftToppings={draftToppings[idx] || []}
                      handleToppingChange={handleToppingChange}
                      toppingOptionsData={toppingOptionsData}
                    />
                  ))}
                </div>
              </div>

              {/* Kanan: hanya tampil kalau item > 1 */}
              {showTwoColumns && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    {t("notYetSelected")}
                  </p>
                  {rightIndices.length === 0 && (
                    <p className="text-xs text-gray-400 italic">
                      {t("allToppingsSelected")}
                    </p>
                  )}
                  <div className="space-y-4">
                    {rightIndices.map((idx) => (
                      <ItemToppingCard
                        key={`right-${idx}`}
                        index={idx}
                        draftToppings={draftToppings[idx] || []}
                        handleToppingChange={handleToppingChange}
                        toppingOptionsData={toppingOptionsData}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 flex justify-end items-center mt-6 gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none transition-colors font-semibold"
            >
              {mode === "add" ? t("addToCart") : t("save")}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

export default ToppingModal;
