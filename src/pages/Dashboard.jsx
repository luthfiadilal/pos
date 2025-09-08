import React, { useState, useEffect } from "react";
import SalesCard from "../components/SalesCard";
import ProductSalesTable from "../components/ProductSalesTable";
import SalesTrendChart from "../components/SalesTrendChart";
import { useAuth } from "../contexts/AuthContext";

// Import semua service yang dibutuhkan
import { getDailySales } from "../services/salesDaily";
import { getMonthlySales } from "../services/salesMonthly";
import { getYearSales } from "../services/salesYearly";
// BARU: Impor service untuk penjualan produk per bulan
import { getOrderProductByMonth } from "../services/orderProductByMonth";

const Dashboard = () => {
  const { user } = useAuth();
  const [dailySales, setDailySales] = useState({ title: "Today's Sales" });
  const [monthlySales, setMonthlySales] = useState({
    title: "This Month's Sales",
  });
  const [yearlySales, setYearlySales] = useState({
    title: "This Year's Sales",
  });

  // BARU: State untuk menampung data tabel dan status loadingnya
  const [productSales, setProductSales] = useState([]);
  const [isProductSalesLoading, setIsProductSalesLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // Guard clause jika user belum ada

    const fetchData = async () => {
      try {
        const { unit_cd, company_cd, branch_cd } = user;

        // Ambil data untuk Sales Cards (tidak berubah)
        // const yearlyRes = await getYearSales(unit_cd, company_cd, branch_cd);
        // if (yearlyRes.data)
        //   setYearlySales({ title: "This Year's Sales", ...yearlyRes.data });

        // const monthlyRes = await getMonthlySales(
        //   unit_cd,
        //   company_cd,
        //   branch_cd
        // );
        // if (monthlyRes.data)
        //   setMonthlySales({ title: "This Month's Sales", ...monthlyRes.data });

        const dailyRes = await getDailySales(unit_cd, company_cd, branch_cd);
        if (dailyRes.data && dailyRes.data.length > 0)
          setDailySales({ title: "Today's Sales", ...dailyRes.data[0] });

        // --- BARU: Ambil data untuk tabel penjualan produk ---
        // 1. Buat periode bulan ini (misal: 202508)
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, "0"); // getMonth() 0-indexed
        const currentPeriod = `${year}${month}`;

        // 2. Panggil API
        const productSalesRes = await getOrderProductByMonth(
          unit_cd,
          company_cd,
          branch_cd,
          currentPeriod
        );

        // 3. Simpan data ke state
        if (productSalesRes && productSalesRes.data) {
          setProductSales(productSalesRes.data);
        }
      } catch (err) {
        console.error("Error fetching sales data:", err);
      } finally {
        // BARU: Set loading ke false setelah selesai
        setIsProductSalesLoading(false);
      }
    };

    fetchData();
  }, [user]); // Dependency array disederhanakan

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sales Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <SalesCard {...dailySales} />
        <SalesCard {...monthlySales} />
        <SalesCard {...yearlySales} />
      </div>

      {/* DIUBAH: Tampilkan loading atau tabel berdasarkan state */}
      {isProductSalesLoading ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          Memuat data penjualan produk...
        </div>
      ) : (
        <ProductSalesTable data={productSales} />
      )}

      <SalesTrendChart />
    </div>
  );
};

export default Dashboard;
