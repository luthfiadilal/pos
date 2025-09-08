import React, { useState, useRef, useEffect, useMemo } from "react";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { getKas } from "../services/kas";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// Format rupiah
const formatRupiah = (number) => "Rp " + number.toLocaleString();

// Format tanggal
const formatTanggal = (dateString) =>
  new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function Kas() {
  const [kasList, setKasList] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date();

  const [dateRange, setDateRange] = useState([
    {
      startDate: today,
      endDate: today,
      key: "selection",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);

  const startDate = dateRange[0].startDate;
  const endDate = dateRange[0].endDate;

  const [saldoKemarin, setSaldoKemarin] = useState(0);

  useEffect(() => {
    if (kasList.length > 0) {
      const yesterday = new Date(startDate);
      yesterday.setDate(yesterday.getDate() - 1);

      const ymd = format(yesterday, "yyyyMMdd");

      const dataKemarin = kasList.find(item =>
        item.trans_date.startsWith(ymd) && item.ending_amnt !== undefined
      );

      setSaldoKemarin(dataKemarin ? dataKemarin.ending_amnt : 0);
    }
  }, [kasList, startDate]);


  useEffect(() => {
    const handler = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };
    if (showModal) {
      document.addEventListener("mousedown", handler);
    }
    return () => document.removeEventListener("mousedown", handler);
  }, [showModal]);

  useEffect(() => {
    const fetchKas = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await getKas(
          "170",
          "100",
          "110",
          {
            date_from: format(startDate, "yyyy-MM-dd"),
            date_to: format(endDate, "yyyy-MM-dd"),
          },
          token
        );
        setKasList(Array.isArray(res) ? res : []);
      } catch (error) {
        console.error("Gagal ambil data kas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKas();
  }, [startDate, endDate]);

  const totalMasuk = useMemo(
    () =>
      kasList
        .filter((k) => k.type === "Masuk")
        .reduce((a, c) => a + c.amount, 0),
    [kasList]
  );

  const totalKeluar = useMemo(
    () =>
      kasList
        .filter((k) => k.type === "Keluar")
        .reduce((a, c) => a + c.amount, 0),
    [kasList]
  );

  const saldoAwal = useMemo(
    () => kasList.filter((k) => k.type === "Saldo Awal").reduce((a, c) => a + c.amount, 0),
    [kasList]
  );

  const saldoAkhir = useMemo(
    () => saldoAwal + totalMasuk - totalKeluar,
    [saldoAwal, totalMasuk, totalKeluar]
  );

  const kasWithRunningSaldo = useMemo(() => {
    let saldo = 0;

    const sorted = [...kasList].sort((a, b) => a.trans_date.localeCompare(b.trans_date));

    return sorted.map((item) => {
      if (item.type === "Keluar") {
        saldo -= item.amount || 0;
      } else if (item.type === "Masuk" || item.type === "Saldo Awal") {
        saldo += item.amount || 0;
      }
      return { ...item, runningSaldo: saldo };
    });
  }, [kasList]);



  const parseDbDate = (dbDate) => {
    if (!dbDate) return null;
    const year = dbDate.substring(0, 4);
    const month = dbDate.substring(4, 6);
    const day = dbDate.substring(6, 8);
    const hour = dbDate.substring(8, 10);
    const minute = dbDate.substring(10, 12);
    const second = dbDate.substring(12, 14);
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg space-y-6 relative">
      <h2 className="text-2xl font-bold text-gray-800">Riwayat Kas</h2>

      {/* Tombol pilih tanggal */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
        >
          {format(startDate, "dd MMM yyyy")} - {format(endDate, "dd MMM yyyy")}
        </button>

        {/* Saldo Harian Kemarin */}
        <div className="bg-gray-50 px-6 py-2 rounded-lg border text-sm font-medium text-gray-700">
          Saldo Harian (Kemarin):{" "}
          <span className="text-gray-900 font-bold">
             {formatRupiah(saldoKemarin)}
          </span>
        </div>
      </div>

      {/* Modal Date Picker */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
          <div ref={modalRef} className="bg-white p-4 rounded-xl shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">
              Pilih Rentang Tanggal
            </h3>
            <DateRange
              ranges={dateRange}
              onChange={(item) => setDateRange([item.selection])}
              rangeColors={["#3b82f6"]}
              moveRangeOnFirstSelection={false}
              months={2}
              direction="horizontal"
            />
            <div className="text-right mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Kas */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700">
            <tr>
              <th className="p-3">Tanggal</th>
              <th className="p-3">Deskripsi</th>
              <th className="p-3">Tipe</th>
              <th className="p-3">Jumlah</th>
              <th className="p-3">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : kasWithRunningSaldo.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  Tidak ada data.
                </td>
              </tr>
            ) : (
              kasWithRunningSaldo.map((item, i) => (
                <tr
                  key={i}
                  className="hover:bg-blue-50 border-b border-gray-100"
                >
                  <td className="p-3">
                    {formatTanggal(parseDbDate(item.trans_date))}
                  </td>
                  <td className="p-3">{item.desc1}</td>
                  <td className="p-3">{item.type}</td>
                  <td className="p-3 font-semibold">
                    {formatRupiah(item.amount)}
                  </td>
                  <td className="p-3 font-semibold">
                    {formatRupiah(item.runningSaldo)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-6 flex flex-col md:flex-row justify-end items-center gap-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
        <div>
          Total Masuk:{" "}
          <span className="text-green-600">{formatRupiah(totalMasuk)}</span>
        </div>
        <div>
          Total Keluar:{" "}
          <span className="text-red-600">{formatRupiah(totalKeluar)}</span>
        </div>
        <div>
          Saldo Akhir:{" "}
          <span className="text-blue-600">{formatRupiah(saldoAkhir)}</span>
        </div>
      </div>
    </div>
  );
}
