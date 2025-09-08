import React, { useState, useMemo, useContext } from "react";
import { Icon } from "@iconify/react";
import { useDebounce } from "use-debounce";
import { OfflineContext } from "../../contexts/OfflineContext";
import { useTranslation } from "react-i18next";

const ProductCard = React.memo(({ item, isOnline, onProductClick }) => {
  const { t } = useTranslation();
  return (
    <div
      onClick={() => {
        if (!item.isSoldOut && isOnline) {
          onProductClick(item);
        }
      }}
      className={`relative bg-white rounded-2xl shadow-sm transition-all duration-300 border cursor-pointer overflow-hidden
        ${
          !isOnline || item.isSoldOut
            ? "opacity-50 pointer-events-none"
            : "hover:shadow-lg"
        }
      `}
    >
      {/* Sold Out Overlay */}
      {(!isOnline || item.isSoldOut) && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-xl font-bold z-10">
          {t("soldOut")}
        </div>
      )}

      {/* Discount Badge */}
      {item.discount > 0 && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-20">
          {t("discountLabel", { discount: item.discount })}
        </span>
      )}

      {/* Topping Icon */}
      {item.hasToppings && (
        <span
          className="absolute top-2 right-2 bg-yellow-400 text-white text-sm p-1 rounded-full flex items-center justify-center z-15"
          title={t("tooltipHasTopping")}
        >
          <Icon icon="solar:chef-hat-minimalistic-broken" className="w-4 h-4" />
        </span>
      )}

      {/* Product Image */}
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-32 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-32 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
          {t("noImage")}
        </div>
      )}

      {/* Product Details */}
      <div className="p-4 text-center">
        <p className="text-xs text-gray-500">
          {t("stockLabel")} {item.stock !== undefined ? item.stock : "N/A"}
        </p>
        <h3
          className="font-semibold text-xs text-gray-800 truncate"
          title={item.name}
        >
          {item.name}
        </h3>
        <p className="text-blue-600 font-bold text-xs mt-1">
          {item.discount > 0 ? (
            <>
              <span className="line-through text-gray-400 mr-1">
                Rp {item.price.toLocaleString()}
              </span>
              Rp{" "}
              {Math.round(
                item.price * (1 - item.discount / 100)
              ).toLocaleString()}
            </>
          ) : (
            <>Rp {item.price.toLocaleString()}</>
          )}
        </p>
      </div>
    </div>
  );
});

const ProductList = ({ products, onProductClick }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const { isOnline } = useContext(OfflineContext);

  const filteredBySearch = useMemo(() => {
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    if (!lowercasedTerm) {
      return products;
    }
    return products.filter((item) =>
      item.name.toLowerCase().includes(lowercasedTerm)
    );
  }, [products, debouncedSearchTerm]);

  return (
    <div>
      {/* Search Input */}
      <div className="mb-4 px-2">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Icon icon="mdi:magnify" className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder={t("placeholderSearchProduct")}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 px-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredBySearch.length > 0 ? (
            filteredBySearch.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                isOnline={isOnline}
                onProductClick={onProductClick}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-sm text-gray-500">
              {t("productNotFound")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductList);
