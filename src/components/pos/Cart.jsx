import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { getMember, registerMember } from "../../services/order";
import { useAuth } from "../../contexts/AuthContext";

const CartItem = React.memo(
  ({
    item,
    index,
    handleRemoveItem,
    updateQty,
    getToppingSummary,
    onEditToppings,
  }) => {
    const { t } = useTranslation();
    const toppingSummary = getToppingSummary(item);

    const lineItemSubtotal = () => {
      let subtotal = item.price * item.qty;
      // const allSelectedToppings = item.selectedToppings?.flat() || [];
      // allSelectedToppings.forEach((toppingName) => {
      //   if (toppingName && toppingName !== "Tanpa Topping") {
      //     const toppingDetails = item.availableToppings.find(
      //       (t) => t.topping_nm === toppingName
      //     );
      //     if (toppingDetails && toppingDetails.is_free === 0) {
      //       subtotal += toppingDetails.price || 0;
      //     }
      //   }
      // });
      return subtotal;
    };

    const toppingsSubtotal = () => {
      let total = 0;
      const allSelectedToppings = item.selectedToppings?.flat() || [];
      allSelectedToppings.forEach((toppingName) => {
        if (toppingName && toppingName !== "Tanpa Topping") {
          const toppingDetails = item.availableToppings.find(
            (t) => t.topping_nm === toppingName
          );
          if (toppingDetails && toppingDetails.is_free === 0) {
            total += toppingDetails.price || 0;
          }
        }
      });
      return total;
    };

    const totalToppingPrice = toppingsSubtotal();

    return (
      <div className="flex flex-col pb-2 border-b">
        <div className="flex justify-between items-center">
          <p className="font-semibold text-md">{item.name}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQty(item.id, -1)}
              className="w-7 h-7 rounded-full text-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
              aria-label={t("ariaReduceQuantity")}
            >
              <Icon icon="solar:minus-square-line-duotone" />
            </button>
            <span className="font-bold text-md w-4 text-center">
              {item.qty}
            </span>
            <button
              onClick={() => updateQty(item.id, 1)}
              className="w-7 h-7 rounded-full text-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-colors"
              aria-label={t("ariaAddQuantity")}
            >
              <Icon icon="solar:add-square-line-duotone" />
            </button>
            <button
              onClick={() => handleRemoveItem(item.id)}
              className="text-red-500 hover:text-red-700 text-lg transition-colors"
              title={t("tooltipRemoveItem")}
              aria-label={t("ariaRemoveItem")}
            >
              <Icon icon="solar:trash-bin-trash-bold" />
            </button>
          </div>
        </div>

        <div className="flex-grow">
          <p className="text-xs text-gray-600">
            <strong>Rp {lineItemSubtotal().toLocaleString()}</strong>
          </p>

          {item.hasToppings && (
            <div className="flex justify-between items-center mt-1">
              <div>
                <p className="text-xs text-gray-500 italic max-w-[80%]">
                  {toppingSummary}
                </p>
                {totalToppingPrice > 0 && (
                  <p className="text-xs text-gray-600">
                    <strong>
                      {t("toppingLabel")} Rp{" "}
                      {totalToppingPrice.toLocaleString()}
                    </strong>
                  </p>
                )}
              </div>
              <button
                onClick={() => onEditToppings(index)}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs p-1 rounded-lg flex items-center gap-1"
                aria-label={t("ariaEditTopping")}
              >
                <Icon
                  icon="solar:pen-new-square-line-duotone"
                  className="text-md"
                />
                <span>{t("edit")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

const Cart = React.memo(
  ({
    cart,
    totalQty,
    cartTotals,
    handleRemoveItem,
    updateQty,
    getToppingSummary,
    onEditToppings,
    handleCheckout,
    memberData,
    pointsToUse,
    onMemberUpdate,
    onPointsUpdate,
  }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    // const [memberPhone, setMemberPhone] = useState("");
    const [memberPhoneInput, setMemberPhoneInput] = useState("");
    // const [memberData, setMemberData] = useState(null);
    // const [pointsToUse, setPointsToUse] = useState(0);
    const [isLoadingMember, setIsLoadingMember] = useState(false);
    const [memberError, setMemberError] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const pointOptions = [50, 100];

    const handlePhoneInputChange = (e) => {
      let value = e.target.value;
      // Hapus semua karakter non-digit
      value = value.replace(/\D/g, "");
      setMemberPhoneInput(value);
    };

    const handleMemberLookup = async () => {
      const mobilePhoneNo = `62${memberPhoneInput.trim()}`;
      if (!mobilePhoneNo.trim() || mobilePhoneNo.trim() === "62") {
        setMemberError("Nomor HP tidak boleh kosong");
        return;
      }

      setIsLoadingMember(true);
      setMemberError("");

      try {
        const response = await getMember(
          user.unit_cd,
          user.company_cd,
          user.branch_cd,
          mobilePhoneNo
        );

        onMemberUpdate(response.member);
        onPointsUpdate(0);
        setMemberPhoneInput(response.member.mobile_phone_no.replace("62", ""));
      } catch (error) {
        setMemberError("Member tidak ditemukan atau terjadi kesalahan");
        onMemberUpdate(null);
      } finally {
        setIsLoadingMember(false);
      }
    };

    const handleResetMember = () => {
      onMemberUpdate(null);
      setMemberPhoneInput("");
      onPointsUpdate(0);
      setMemberError("");
    };

    const handleRegisterMember = async () => {
      const mobilePhoneNo = `62${memberPhoneInput.trim()}`;
      if (!mobilePhoneNo.trim() || mobilePhoneNo.trim() === "62") {
        setMemberError("Nomor HP tidak boleh kosong");
        return;
      }

      setIsRegistering(true);
      setMemberError("");

      const payload = {
        unit_cd: user.unit_cd,
        company_cd: user.company_cd,
        branch_cd: user.branch_cd,
        mobile_phone_no: mobilePhoneNo,
        userDetails: { userId: user.user_id, userName: user.name },
      };

      try {
        const response = await registerMember(payload);
        // Setelah sukses registrasi, langsung tampilkan data member
        onMemberUpdate(response.member);
        onPointsUpdate(0);
        setMemberPhoneInput(response.member.mobile_phone_no.replace("62", ""));
        alert("Pendaftaran member berhasil!");
      } catch (error) {
        if (error.response && error.response.status === 409) {
          setMemberError("Member sudah terdaftar. Silakan cari.");
        } else {
          setMemberError("Pendaftaran member gagal. Silakan coba lagi.");
        }
        onMemberUpdate(null);
      } finally {
        setIsRegistering(false);
      }
    };

    const handleAddPoints = (pointsToAdd) => {
      const newTotalPoints = pointsToUse + pointsToAdd;
      const currentBalance = Number(memberData.current_balance || 0);

      // Batasan: user harus menyisakan minimal 50 poin
      const maxUsablePoints = currentBalance > 50 ? currentBalance - 50 : 0;

      // Tidak boleh melebihi total belanja (misal 1 poin = Rp1000)
      const maxPointsByCart = Math.floor(cartTotals.grandTotal / 1000);

      // Batas akhir adalah yg paling kecil dari saldo-50 dan total belanja
      const maxPoints = Math.min(maxUsablePoints, maxPointsByCart);

      if (currentBalance <= 50) {
        alert(
          "Saldo poin kurang dari atau sama dengan 50, tidak bisa digunakan."
        );
        return;
      }

      if (newTotalPoints <= maxPoints && newTotalPoints > 0) {
        onPointsUpdate(newTotalPoints);
      } else {
        alert(
          `Tidak dapat menggunakan poin melebihi batas. Maksimal yang bisa digunakan: ${maxPoints}`
        );
      }
    };

    const handleResetPoints = () => {
      onPointsUpdate(0);
    };

    return (
      <div className="absolute inset-0 flex flex-col  bg-white shadow-sm">
        <div className="flex-shrink-0 p-2  border-b">
          <h2 className="flex items-center px-3 py-1 text-sm font-medium rounded-full border border-white text-gray-700">
            <Icon
              icon="solar:cart-large-2-bold"
              className="text-blue-600 text-xl"
            />
            {t("cart")}
          </h2>
        </div>

        <div className="flex-grow overflow-y-auto p-2 ">
          {cart.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <p className="text-gray-400">
                {t("cartEmpty")} <br /> {t("pleaseSelectProduct")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item, index) => (
                <CartItem
                  key={`${item.id}-${index}-${JSON.stringify(
                    item.selectedToppings
                  )}`}
                  item={item}
                  index={index}
                  handleRemoveItem={handleRemoveItem}
                  updateQty={updateQty}
                  getToppingSummary={getToppingSummary}
                  onEditToppings={onEditToppings}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 p-2 border-t bg-white">
          {cart.length > 0 && cartTotals && (
            <div className="text-xs text-gray-600 space-y-2 mb-2">
              {!memberData ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRegisterMember}
                    disabled={isRegistering || !memberPhoneInput.trim()}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white p-1.5 rounded-md"
                    title={t("tooltipRegisterMember")}
                  >
                    {isRegistering ? (
                      <Icon
                        icon="solar:refresh-bold"
                        className="text-lg animate-spin text-green-700"
                      />
                    ) : (
                      <Icon
                        icon="solar:user-plus-bold-duotone"
                        className="text-lg"
                      />
                    )}
                  </button>
                  <span className="text-sm font-semibold text-gray-600">
                    +62
                  </span>
                  <input
                    type="tel"
                    placeholder={t("placeholderMemberCode")}
                    // className="w-full border rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                    value={memberPhoneInput}
                    onChange={handlePhoneInputChange}
                    className="flex-1 border rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoadingMember || isRegistering}
                  />
                  {/* <button className="bg-gray-200 hover:bg-gray-300 p-1.5 rounded-md">
                  <Icon
                    icon="solar:user-check-bold-duotone"
                    className="text-lg text-gray-600"
                  />
                </button> */}
                  <button
                    onClick={handleMemberLookup}
                    disabled={isLoadingMember || !memberPhoneInput.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-1.5 rounded-md"
                  >
                    {isLoadingMember ? (
                      <Icon
                        icon="solar:refresh-bold"
                        className="text-lg animate-spin"
                      />
                    ) : (
                      <Icon
                        icon="solar:user-bold-duotone"
                        className="text-lg"
                      />
                    )}
                  </button>
                </div>
              ) : (
                // Display member data dan points usage
                <div className="space-y-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Member: {memberData.member_id}
                      </p>
                      <div className="flex gap-4">
                        <p className="text-xs text-green-600">
                          Saldo Poin: {memberData.current_balance}
                        </p>
                        {/* Info batas maksimal */}
                        <p className="text-xs text-gray-500">
                          Maksimal dapat digunakan:{" "}
                          <strong className="text-blue-600">
                            {Math.min(
                              memberData.current_balance > 50
                                ? memberData.current_balance - 50
                                : 0,
                              Math.floor(cartTotals.grandTotal / 1000)
                            )}
                          </strong>{" "}
                          poin
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleResetMember}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      <Icon
                        icon="solar:close-circle-bold"
                        className="text-lg"
                      />
                    </button>
                  </div>

                  {memberData.current_balance > 0 && (
                    <div className="flex flex-col gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="text-xs text-gray-600">
                          Poin digunakan:{" "}
                          <strong className="text-green-700">
                            {pointsToUse}
                          </strong>
                        </label>
                        <button
                          onClick={handleResetPoints}
                          className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full hover:bg-gray-300 transition-colors"
                        >
                          Reset
                        </button>
                        <div className="flex gap-1.5">
                          {pointOptions.map((option) => (
                            <button
                              key={option}
                              onClick={() => handleAddPoints(option)}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              +{option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <hr className="my-1" />
              <div className="flex justify-between items-center">
                <span className="text-gray-800 text-md">{t("totalQty")}</span>
                <strong className="text-gray-800 text-md">{totalQty}</strong>
              </div>
              <hr className="my-1" />
              <div className="flex justify-between items-center">
                <span>{t("subtotal")}</span>
                <span className="text-gray-800">
                  Rp {cartTotals.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  className="text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full flex items-center gap-1 transition-colors duration-200"
                  aria-expanded={isDetailsOpen}
                >
                  <span>
                    {isDetailsOpen ? t("hideDetails") : t("showDetails")}
                  </span>
                  <Icon
                    icon="solar:alt-arrow-down-bold-duotone"
                    className={`transition-transform duration-300 ${
                      isDetailsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden space-y-1 ${
                  isDetailsOpen ? "max-h-40" : "max-h-0"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{t("pb1")}</span>
                  <span className="text-gray-800">
                    Rp {cartTotals.totalPb1.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t("ppn")}</span>
                  <span className="text-gray-800">
                    Rp {cartTotals.totalPpn.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t("service")}</span>
                  <span className="text-gray-800">
                    Rp {cartTotals.totalService.toLocaleString()}
                  </span>
                </div>
              </div>
              <hr className="my-1" />
              <div className="flex justify-between items-center font-bold">
                <span className="text-lg">{t("totalAmount")}</span>
                <strong className="text-blue-600 text-lg">
                  Rp {cartTotals.grandTotal.toLocaleString()}
                </strong>
              </div>
              {memberError && (
                <p className="text-xs text-red-500">{memberError}</p>
              )}
            </div>
          )}

          <button
            onClick={handleCheckout}
            className="bg-blue-500 hover:bg-blue-600 text-white w-full py-2 text-base rounded-lg transition duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cart.length === 0}
          >
            <Icon icon="solar:wallet-bold-duotone" className="text-lg" />
            {t("checkout")}
          </button>
        </div>
      </div>
    );
  }
);

export default Cart;
