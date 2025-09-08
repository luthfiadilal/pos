import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { getProducts } from "../services/product";

// Komponen-komponen utama
import ProductList from "../components/pos/ProductList";
import CategoryFilter from "../components/pos/CategoryFilter";
import Cart from "../components/pos/Cart";

import ProductSkeleton from "../components/ui/ProductSkeleton";

// Lazy loading modals
const ToppingModal = lazy(() => import("../components/pos/ToppingModal"));
const PaymentMethodModal = lazy(() =>
  import("../components/pos/PaymentMethodModal")
);
const CashPaymentModal = lazy(() =>
  import("../components/pos/CashPaymentModal")
);
const DebitCreditPaymentModal = lazy(() =>
  import("../components/pos/DebitCreditPaymentModal")
);
const ReceiptModal = lazy(() => import("../components/pos/ReceiptModal"));
const QRISPaymentModal = lazy(() =>
  import("../components/pos/QRISPaymentModal")
);

export default function POS() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("All Categories");
  const [selectedSubGroup, setSelectedSubGroup] =
    useState("All Sub-categories");
  const token = localStorage.getItem("token");
  const [isToppingModalOpen, setIsToppingModalOpen] = useState(false);
  const [editingCartItemIndex, setEditingCartItemIndex] = useState(null);
  const [productForToppingSelection, setProductForToppingSelection] =
    useState(null);
  const [receiptMethod, setReceiptMethod] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [pin, setPin] = useState("");
  const [selectedQRIS, setSelectedQRIS] = useState("");

  useEffect(() => {
    const fetchProductsData = async () => {
      if (!user) {
        setError(new Error("User data not available. Please log in."));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { unit_cd, company_cd, branch_cd } = user;
        const response = await getProducts(unit_cd, company_cd, branch_cd);
        const mappedProducts = response.map((item) => {
          const isSoldOut =
            item.is_sold_out === 1 ||
            item.is_product_stock === 0 ||
            (item.stock && item.stock.ending_qty <= 0);
          const priceInfo =
            item.prices && item.prices.length > 0 ? item.prices[0] : {};
          return {
            id: item.product_cd,
            name: item.product_nm,
            barcode: item.barcode,
            image: item.product_file_img_server,
            stock: item.stock?.ending_qty ?? "N/A",
            isSoldOut: isSoldOut,
            price: priceInfo.basic_sales_price || 0,
            effectiveDate: priceInfo.effective_date || "",
            group: item.group ? item.group.product_grp_desc : "Uncategorized",
            subGroup: item.subGroup
              ? item.subGroup.product_subgrp_desc
              : "Uncategorized",
            category:
              item.group && item.subGroup
                ? `${item.group.product_grp_desc} - ${item.subGroup.product_subgrp_desc}`
                : item.group
                ? item.group.product_grp_desc
                : "Uncategorized",
            availableToppings: item.toppings || [],
            hasToppings: (item.toppings || []).length > 0,
            discount: 0,
          };
        });
        setProducts(mappedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductsData();
  }, [user]);

  const calculateItemTotalPrice = useCallback((item) => {
    const toppingsTotal =
      item.selectedToppings
        ?.map((selectedToppingName) => {
          const toppingDetails = item.availableToppings.find(
            (t) => t.topping_nm === selectedToppingName
          );
          if (toppingDetails && toppingDetails.is_free === 0) {
            return toppingDetails.toppingPrices?.[0]?.basic_sales_price || 0;
          }
          return 0;
        })
        .reduce((sum, price) => sum + price, 0) || 0;
    return item.price * item.qty + toppingsTotal;
  }, []);

  const handleAddToCart = useCallback((productToAdd) => {
    // Logika ini belum menangani item yang sama dengan topping berbeda
    // Untuk sementara, kita biarkan sesuai kode asli Anda
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === productToAdd.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === productToAdd.id
            ? {
                ...item,
                qty: item.qty + productToAdd.qty,
                selectedToppings: [
                  ...item.selectedToppings,
                  ...productToAdd.selectedToppings,
                ],
              }
            : item
        );
      } else {
        return [...prev, productToAdd];
      }
    });
  }, []);

  const handleProductClick = useCallback(
    (product) => {
      if (product.hasToppings) {
        setProductForToppingSelection({
          ...product,
          qty: 1,
          selectedToppings: [""],
        });
        setIsToppingModalOpen(true);
      } else {
        handleAddToCart({ ...product, qty: 1, selectedToppings: [] });
      }
    },
    [handleAddToCart]
  );

  const handleConfirmAddToCart = useCallback(
    (productWithToppings) => {
      handleAddToCart(productWithToppings);
      setIsToppingModalOpen(false);
      setProductForToppingSelection(null);
    },
    [handleAddToCart]
  );

  const handleRemoveItem = useCallback((productId) => {
    // Unique ID diperlukan jika ada item sama dg topping beda
    // Untuk sekarang, kita gunakan productId sesuai kode asli Anda
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQty = useCallback((productId, delta) => {
    // Logika ini juga akan perlu penyesuaian jika ada item sama dg topping beda
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = Math.max(item.qty + delta, 0);
            if (newQty === 0) return null;
            // Logika update topping saat qty berubah...
            const newSelectedToppings = [...item.selectedToppings];
            if (delta > 0) {
              newSelectedToppings.push("");
            } else if (newSelectedToppings.length > newQty) {
              newSelectedToppings.splice(newQty);
            }
            return {
              ...item,
              qty: newQty,
              selectedToppings: newSelectedToppings,
            };
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const handleToppingChange = useCallback(
    (toppingSlotIndex, value) => {
      setCart((prevCart) =>
        prevCart.map((item, index) => {
          if (index === editingCartItemIndex) {
            const newSelectedToppings = [...item.selectedToppings];
            newSelectedToppings[toppingSlotIndex] = value;
            return { ...item, selectedToppings: newSelectedToppings };
          }
          return item;
        })
      );
    },
    [editingCartItemIndex]
  );

  const handleCheckout = useCallback(() => {
    if (cart.length > 0) setShowCheckoutModal(true);
  }, [cart.length]);

  const handlePrintReceipt = useCallback((method) => {
    setShowReceipt(true);
    setReceiptMethod(method);
    setPaymentMethod("");
    setCashReceived("");
    setSelectedBank("");
    setPin("");
    setSelectedQRIS("");
    setShowCheckoutModal(false);
  }, []);

  const getToppingSummary = useCallback((item) => {
    const { selectedToppings, availableToppings } = item;
    if (!selectedToppings || selectedToppings.filter((t) => t).length === 0) {
      return null; // Return null jika tidak ada topping terpilih
    }

    // Hitung jumlah setiap topping yang dipilih
    const toppingCounts = selectedToppings.reduce((acc, toppingName) => {
      if (toppingName) {
        acc[toppingName] = (acc[toppingName] || 0) + 1;
      }
      return acc;
    }, {});

    // Buat string ringkasan dengan nama, jumlah, dan harga
    return Object.entries(toppingCounts)
      .map(([toppingName, count]) => {
        const toppingDetails = availableToppings.find(
          (t) => t.topping_nm === toppingName
        );

        if (!toppingDetails) {
          return `${toppingName} (x${count})`; // Fallback jika detail tidak ditemukan
        }

        const price = toppingDetails.toppingPrices?.[0]?.basic_sales_price || 0;
        const isFree = toppingDetails.is_free === 1;

        if (isFree || price === 0) {
          return `${toppingName} (x${count})`; // Bisa juga ditambahkan '(Free)' jika perlu
        }

        return `${toppingName} (x${count}) @ Rp ${price.toLocaleString()}`;
      })
      .join(", ");
  }, []);

  const totalQty = useMemo(
    () => cart.reduce((acc, item) => acc + item.qty, 0),
    [cart]
  );

  const totalAmount = useMemo(
    () => cart.reduce((acc, item) => acc + calculateItemTotalPrice(item), 0),
    [cart, calculateItemTotalPrice]
  );

  const uniqueGroups = useMemo(
    () => ["All Categories", ...new Set(products.map((p) => p.group))],
    [products]
  );

  const currentSubGroups = useMemo(() => {
    if (selectedGroup === "All Categories") return ["All Sub-categories"];
    const subGroups = new Set(
      products
        .filter((p) => p.group === selectedGroup && p.subGroup)
        .map((p) => p.subGroup)
    );
    return ["All Sub-categories", ...Array.from(subGroups)];
  }, [products, selectedGroup]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesGroup =
        selectedGroup === "All Categories" || product.group === selectedGroup;
      const matchesSubGroup =
        selectedSubGroup === "All Sub-categories" ||
        product.subGroup === selectedSubGroup;
      return matchesGroup && matchesSubGroup;
    });
  }, [products, selectedGroup, selectedSubGroup]);

  const itemForModal = useMemo(() => {
    if (productForToppingSelection) return productForToppingSelection;
    if (editingCartItemIndex !== null) return cart[editingCartItemIndex];
    return null;
  }, [productForToppingSelection, editingCartItemIndex, cart]);

  const handleDigitalPayment = async () => {
    setIsPaymentLoading(true);

    const checkoutData = {
      // Ambil identifier dari objek 'user'
      unit_cd: user.unit_cd,
      company_cd: user.company_cd,
      branch_cd: user.branch_cd,
      teller_cd: "T1",

      cart: cart.map((item) => ({
        product_cd: item.id,
        product_nm: item.name,
        price: item.price,
        quantity: item.qty,
        toppings: item.selectedToppings
          ?.filter((t) => t)
          .map((toppingName) => {
            const details = item.availableToppings.find(
              (t) => t.topping_nm === toppingName
            );
            return {
              topping_cd: details?.topping_cd || "", // ❗ WAJIB kalau insert ke PosSalesTopTrn
              topping_nm: toppingName,
              price: details?.toppingPrices?.[0]?.basic_sales_price || 0,
            };
          }),
      })),

      userDetails: {
        userId: user?.user_id || "guest-user",
        userName: user?.name || "Guest",
        userEmail: user?.email || "guest@example.com",
        userPhone: user?.phone_no || "081234567890",
      },
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/pos/payment",
        checkoutData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.redirect_url) {
        window.location.href = response.data.redirect_url;
      }
    } catch (error) {
      console.error("Gagal memulai pembayaran:", error);
      alert(error.response?.data?.message || "Gagal memulai pembayaran.");
      setIsPaymentLoading(false);
    }
  };

  const handleNewOrder = () => {
    setCart([]);
    console.log("Pesanan baru dimulai, keranjang dikosongkan.");
  };

  if (loading)
    return (
      <div className="p-4">
        <ProductSkeleton count={12} />
      </div>
    );
  if (error)
    return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    // [1] Container utama diubah menjadi flex-col untuk menampung footer
    // `h-full` membuatnya mengisi sisa ruang dari MainLayout
    <div className="flex flex-col h-full p-4 gap-4 bg-gray-100">
      {/* [2] Area Konten Utama (Produk + Keranjang) */}
      {/* `flex-grow` membuatnya mengisi ruang, `overflow-hidden` mencegahnya "bocor" */}
      <div className="flex-grow flex flex-col lg:flex-row gap-4 overflow-hidden">
        {/* --- KOLOM KIRI (PRODUK) --- */}
        <div className="w-full lg:w-7/12 xl:w-8/12 flex flex-col gap-4">
          <div className="flex-shrink-0 bg-white rounded-lg shadow-sm p-2">
            <CategoryFilter
              categories={uniqueGroups}
              selectedFilter={selectedGroup}
              setFilter={(group) => {
                setSelectedGroup(group);
                setSelectedSubGroup("All Sub-categories");
              }}
              label="Category"
            />
            {currentSubGroups.length > 1 &&
              selectedGroup !== "All Categories" && (
                <CategoryFilter
                  categories={currentSubGroups}
                  selectedFilter={selectedSubGroup}
                  setFilter={setSelectedSubGroup}
                  label="Sub-Category"
                />
              )}
          </div>

          <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm p-4">
            <ProductList
              products={filteredProducts}
              onProductClick={handleProductClick}
            />
          </div>
        </div>

        {/* --- KOLOM KANAN (KERANJANG) --- */}
        {/* `relative` diperlukan agar Cart bisa mengisi penuh kolom ini */}
        <div className="w-full lg:w-5/12 xl:w-4/12 relative">
          <Cart
            cart={cart}
            totalQty={totalQty}
            totalAmount={totalAmount}
            handleRemoveItem={handleRemoveItem}
            updateQty={updateQty}
            calculateItemTotalPrice={calculateItemTotalPrice}
            getToppingSummary={getToppingSummary}
            onEditToppings={(index) => {
              setEditingCartItemIndex(index);
              setIsToppingModalOpen(true);
            }}
            handleCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* [3] Area Footer */}
      {/* `flex-shrink-0` memastikan footer tidak ikut gepeng */}
      <div className="flex-shrink-0 bg-white p-3 rounded-lg shadow-md">
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2">
            <button className="px-4 py-3 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">
              Tahan Pesanan
            </button>
            <button className="px-4 py-3 text-sm font-semibold text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors">
              Lihat Pesanan
            </button>
          </div>
          <div className="text-xs text-gray-500 hidden lg:block">
            Kasir: <strong>{user?.name || "Admin"}</strong>
          </div>
          <button
            onClick={handleNewOrder}
            className="px-4 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Pesanan Baru
          </button>
        </div>
      </div>

      {/* [4] Suspense dan Modals (tidak berubah) */}
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center text-white">
            Loading...
          </div>
        }
      >
        {isToppingModalOpen && itemForModal && (
          <ToppingModal
            key={itemForModal.id || editingCartItemIndex}
            item={itemForModal}
            mode={productForToppingSelection ? "add" : "edit"}
            onClose={() => {
              setIsToppingModalOpen(false);
              setProductForToppingSelection(null);
              setEditingCartItemIndex(null);
            }}
            onConfirmAddToCart={handleConfirmAddToCart}
            onSaveChanges={handleToppingChange}
          />
        )}
        {showCheckoutModal && (
          <PaymentMethodModal
            onClose={() => setShowCheckoutModal(false)}
            onSelectCash={() => setPaymentMethod("cash")}
            onSelectDebit={() => setPaymentMethod("debit")}
            onSelectDigital={handleDigitalPayment}
            isLoading={isPaymentLoading}
            cart={cart}
            totalAmount={totalAmount}
          />
        )}
        {paymentMethod === "cash" && (
          <CashPaymentModal
            totalAmount={totalAmount}
            cashReceived={cashReceived}
            setCashReceived={setCashReceived}
            handlePrintReceipt={handlePrintReceipt}
          />
        )}
        {paymentMethod === "debit" && (
          <DebitCreditPaymentModal
            totalAmount={totalAmount}
            selectedBank={selectedBank}
            setSelectedBank={setSelectedBank}
            pin={pin}
            setPin={setPin}
            handlePrintReceipt={handlePrintReceipt}
          />
        )}

        {paymentMethod === "qris" && (
          <QRISPaymentModal
            totalAmount={totalAmount}
            selectedQRIS={selectedQRIS}
            setSelectedQRIS={setSelectedQRIS}
            handlePrintReceipt={handlePrintReceipt}
          />
        )}
        {showReceipt && (
          <ReceiptModal
            receiptMethod={receiptMethod}
            cart={cart}
            totalAmount={totalAmount}
            setShowReceipt={setShowReceipt}
            setCart={setCart}
            getToppingSummary={getToppingSummary}
            calculateItemTotalPrice={calculateItemTotalPrice}
          />
        )}
      </Suspense>
    </div>
  );
}
