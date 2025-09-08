import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Menu() {
  const navigate = useNavigate();
  const [openingBalance, setOpeningBalance] = useState(null);
  const [usePayment, setUsePayment] = useState(null);

  useEffect(() => {
    const storedBalance = localStorage.getItem("openingBalance");
    const storedPayment = localStorage.getItem("usePayment");

    setOpeningBalance(storedBalance);
    setUsePayment(storedPayment === "true");
  }, []);

  const MenuButton = ({ icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="bg-white hover:bg-blue-50 border border-gray-200 shadow-sm rounded-xl px-6 py-4 flex flex-col items-center gap-2 transition"
    >
      <Icon icon={icon} className="text-3xl text-blue-600" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-lg text-center mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-3">Menu Awal</h2>
        <p className="text-sm text-gray-600">
          Saldo Awal:{" "}
          <strong>Rp {parseInt(openingBalance || 0).toLocaleString()}</strong>
        </p>
        <p className="text-sm text-gray-600">
          Fitur Payment:{" "}
          <strong className={usePayment ? "text-green-600" : "text-red-500"}>
            {usePayment ? "Aktif" : "Nonaktif"}
          </strong>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-lg">
        <MenuButton
          icon="solar:play-circle-bold"
          label="Start of Day"
          onClick={() => navigate("/sod")}
        />
        <MenuButton
          icon="solar:cart-large-2-bold"
          label="Order"
          onClick={() => navigate("/pos")}
        />
        <MenuButton
          icon="solar:wallet-linear"
          label="End of Day"
          onClick={() => navigate("/eod")}
        />
        {/* Tambahkan fitur lain jika perlu */}
      </div>
    </div>
  );
}
