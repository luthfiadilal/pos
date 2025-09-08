import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { getCurrencyData } from "../services/currency";
import { checkExistingSOD, saveSOD } from "../services/cashdraw";

export const useStartOfDay = () => {
  const { t, i18n } = useTranslation();
  const [usePayment, setUsePayment] = useState(true);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ message: "", type: "" });
  const [tellers, setTellers] = useState([]);
  const [selectedTeller, setSelectedTeller] = useState("");
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [moneyDenoms, setMoneyDenoms] = useState([]);
  const [denomCounts, setDenomCounts] = useState({});
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (user) {
      if (user.teller && user.teller.length > 0) {
        setTellers(user.teller);
        setSelectedTeller(user.teller[0].teller_cd);
      }
      const fetchCurrencyData = async () => {
        setLoading(true);
        try {
          const response = await getCurrencyData(
            user.unit_cd,
            user.company_cd,
            user.branch_cd
          );

          const { currencies: apiCurrencies, moneyDenoms: apiDenoms } =
            response;
          if (apiCurrencies && apiCurrencies.length > 0) {
            setCurrencies(apiCurrencies);
            setSelectedCurrency(apiCurrencies[0].currency_cd);
          }
          if (apiDenoms && apiDenoms.length > 0) {
            setMoneyDenoms(apiDenoms);
            const initialCounts = apiDenoms.reduce((acc, denom) => {
              acc[denom.money_value] = 0;
              return acc;
            }, {});
            setDenomCounts(initialCounts);
          }
        } catch (error) {
          console.error("❌ Error fetching currency data:", error);
          setModal({
            message: t("errorFetchCurrency"),
            type: "error",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchCurrencyData();
    }
  }, [isAuthenticated, navigate, user, t]);

  const handleDenomCountChange = useCallback((moneyValue, updater) => {
    setDenomCounts((prevCounts) => {
      const currentValue = prevCounts[moneyValue] || 0;
      const newValue =
        typeof updater === "function"
          ? updater(currentValue)
          : parseInt(updater, 10) || 0;
      return {
        ...prevCounts,
        [moneyValue]: newValue < 0 ? 0 : newValue,
      };
    });
  }, []);

  const totalBalance = useMemo(() => {
    return moneyDenoms.reduce((total, denom) => {
      const count = denomCounts[denom.money_value] || 0;
      return total + denom.money_value * count;
    }, 0);
  }, [moneyDenoms, denomCounts]);

  const formatCurrency = useCallback(
    (value) => {
      const currencyCode =
        currencies.find((c) => c.currency_cd === selectedCurrency)
          ?.currency_cd || "IDR";
      return new Intl.NumberFormat({
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 0,
      }).format(value);
    },
    [i18n.language, currencies, selectedCurrency]
  );

  const handleSave = async (event) => {
    event.preventDefault();

    if (!selectedTeller || !selectedCurrency) {
      setModal({ message: t("errorCompleteAllFields"), type: "error" });
      return;
    }
    if (usePayment && totalBalance <= 0) {
      setModal({ message: t("errorInitialBalanceZero"), type: "error" });
      return;
    }
    if (!user) {
      setModal({ message: t("errorInvalidUserToken"), type: "error" });
      return;
    }

    setLoading(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      const checkResponse = await checkExistingSOD(user.user_id, today);

      if (checkResponse.exists) {
        throw new Error(t("errorSodExists", { name: user.name }));
      }

      const payload = {
        unit_cd: user.unit_cd,
        company_cd: user.company_cd,
        branch_cd: user.branch_cd,
        teller_cd: selectedTeller,
        currency_cd: selectedCurrency,
        cashier_id: user.user_id,
        cashier_nm: user.name,
        is_cash_rcv: usePayment ? 1 : 0,
        details: [],
      };

      if (usePayment) {
        payload.details = Object.entries(denomCounts)
          .filter(([_, count]) => count > 0)
          .map(([value, count]) => ({
            money_denom_value: value,
            begin_money_cnt: count,
          }));
      }

      const response = await saveSOD(payload);

      console.log("API Response:", response);
      setModal({
        message: t("successSodSaved"),
        type: "success",
      });
      setTimeout(() => navigate("/pos"), 1500);
    } catch (error) {
      console.error("❌ Error during Start of Day process:", error);

      const errorMessage =
        error.response?.data?.message || error.message || t("errorSavingData");

      setModal({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    modal,
    setModal,
    tellers,
    selectedTeller,
    setSelectedTeller,
    currencies,
    selectedCurrency,
    setSelectedCurrency,
    moneyDenoms,
    denomCounts,
    usePayment,
    setUsePayment,
    totalBalance,
    formatCurrency,
    handleDenomCountChange,
    handleSave,
  };
};
