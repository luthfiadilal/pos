import { useState, useEffect, useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import { useAuth } from "../contexts/AuthContext";
import { getFloors } from "../services/floor";
// import { getTableCategories } from "../services/tableCategory";
import { getTables } from "../services/table";
import { useNavigate } from "react-router-dom";
import { useOrder } from "../contexts/OrderContext";
import GuestInputModal from "../components/table/GuestInputModal";
// import Draggable from "react-draggable";
import {
  DndContext,
  useDraggable,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
// --- HELPER BARU DI LUAR KOMPONEN ---

// 1. Helper untuk menghitung posisi grid default
const calculateDefaultGridPositions = (tables, containerWidth) => {
  const layout = {};
  // Jangan kalkulasi jika lebar kontainer belum terukur atau tidak ada meja
  if (containerWidth <= 0 || !tables || tables.length === 0) return layout;

  const cardWidth = 150;
  const cardHeight = 130;
  const gap = 16;

  // DIUBAH: Pastikan kolom minimal 1 untuk menghindari pembagian dengan nol
  // dan agar tidak tumpang tindih di layar sempit.
  const columns = Math.max(1, Math.floor(containerWidth / (cardWidth + gap)));

  tables.forEach((table, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = col * (cardWidth + gap) + gap;
    const y = row * (cardHeight + gap) + gap;
    layout[table.tbl_cd] = { x, y };
  });

  return layout;
};

// 2. Helper untuk menghitung tinggi kanvas agar bisa scroll
const calculateCanvasHeight = (layout) => {
  const cardHeight = 130;
  const gap = 16;
  let maxY = 0;

  Object.values(layout).forEach((pos) => {
    if (pos.y > maxY) {
      maxY = pos.y;
    }
  });

  return maxY + cardHeight + gap; // Tinggi total
};

// --- Komponen Kartu Meja (Bisa dipisah ke file sendiri) ---
const TableCard = ({
  table,
  isEditMode,
  activeSession,
  onSelect,
  onPayment,
}) => {
  const isUsedFromAPI = table.tbl_desc?.toLowerCase().includes("digunakan");
  const isInActiveSession = !!activeSession;

  let cardStyle = "bg-blue-500 text-white"; // Default style
  if (isUsedFromAPI || isInActiveSession) cardStyle = "bg-red-500 text-white";
  if (isEditMode) {
    cardStyle += " cursor-move border-2 border-dashed border-white";
  } else if (!isUsedFromAPI && !isInActiveSession) {
    cardStyle += " cursor-pointer hover:bg-blue-600";
  } else {
    cardStyle += " cursor-not-allowed";
  }

  return (
    <div
      onClick={() => !isEditMode && onSelect(table)}
      className={`w-[150px] h-[130px] rounded-xl p-2 border shadow-sm transition-all flex flex-col justify-between ${cardStyle}`}
    >
      <div>
        <div className="text-xl font-bold ml-1 space-y-1">
          <p>{table.tbl_desc}</p>
        </div>
      </div>
      {isInActiveSession && (
        <div className="mt-2 pt-2 border-t border-white/30 text-center">
          <p
            className="text-xs font-bold mb-2 truncate"
            title={activeSession.guests.name}
          >
            {activeSession.guests.name} ({activeSession.guests.total} Tamu)
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPayment(activeSession);
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-3 rounded-lg"
          >
            Bayar
          </button>
        </div>
      )}
    </div>
  );
};

// --- KOMPONEN UTAMA HALAMAN ---
export default function MejaPage() {
  const { user, bizType } = useAuth();
  const [dataLantai, setDataLantai] = useState([]);
  const [lantaiAktif, setLantaiAktif] = useState("");
  const [dataMejaAll, setDataMejaAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableForSelection, setTableForSelection] = useState(null);

  // State untuk layout dinamis
  const [isEditMode, setIsEditMode] = useState(false);
  const [tableLayout, setTableLayout] = useState({});

  // Ref untuk mengukur lebar kanvas
  const canvasRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

  const navigate = useNavigate();
  const { activeSessions, startDraftOrder } = useOrder();
  const mejaTerfilter = useMemo(
    () => dataMejaAll.filter((m) => m.floor?.floor_desc === lantaiAktif),
    [dataMejaAll, lantaiAktif]
  );
  // Efek untuk mengambil data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [floors, allTables] = await Promise.all([
          getFloors(user.unit_cd, user.company_cd, user.branch_cd),
          // getTableCategories(user.unit_cd, user.company_cd, user.branch_cd),
          getTables(user.unit_cd, user.company_cd, user.branch_cd),
        ]);

        setDataLantai(floors);
        // setDataKategori(categories);
        setDataMejaAll(allTables);

        if (floors.length > 0) {
          setLantaiAktif(floors[0].floor_desc);
        }
      } catch (err) {
        console.error("❌ Gagal fetch data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Efek untuk mengukur lebar kanvas
  useEffect(() => {
    if (canvasRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        setCanvasWidth(entries[0].contentRect.width);
      });
      resizeObserver.observe(canvasRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [mejaTerfilter]); // Dijalankan ulang jika data meja berubah

  // Efek untuk memuat/mengkalkulasi layout
  useEffect(() => {
    if (!lantaiAktif || mejaTerfilter.length === 0) return;
    const floorObject = dataLantai.find((f) => f.floor_desc === lantaiAktif);
    if (!floorObject) return;

    const savedLayout = sessionStorage.getItem(
      `tableLayout_${floorObject.floor_cd}`
    );
    if (savedLayout) {
      setTableLayout(JSON.parse(savedLayout));
    } else {
      // Jika tidak ada layout tersimpan, kalkulasi layout grid default
      const defaultLayout = calculateDefaultGridPositions(
        mejaTerfilter,
        canvasWidth
      );
      setTableLayout(defaultLayout);
    }
  }, [lantaiAktif, dataLantai, mejaTerfilter, canvasWidth]);

  // Handler untuk layout
  const handleDragEnd = ({ active, delta }) => {
    const tableId = active.id;
    setTableLayout((prevLayout) => ({
      ...prevLayout,
      [tableId]: {
        x: (prevLayout[tableId]?.x || 0) + delta.x,
        y: (prevLayout[tableId]?.y || 0) + delta.y,
      },
    }));
  };

  const handleSaveLayout = () => {
    const floorObject = dataLantai.find((f) => f.floor_desc === lantaiAktif);
    if (!floorObject) return;
    sessionStorage.setItem(
      `tableLayout_${floorObject.floor_cd}`,
      JSON.stringify(tableLayout)
    );
    setIsEditMode(false);
    alert("Layout berhasil disimpan untuk sesi ini!");
  };
  const handleResetLayout = () => {
    if (window.confirm("Anda yakin ingin mengembalikan layout ke default?")) {
      // ... (logika hapus dari session storage)
      // Kalkulasi ulang layout default setelah reset
      const defaultLayout = calculateDefaultGridPositions(
        mejaTerfilter,
        canvasWidth
      );
      setTableLayout(defaultLayout);
      setIsEditMode(false);
    }
  };

  const handleSelectTable = (tableObject) => {
    setTableForSelection(tableObject);
    setIsModalOpen(true);
  };

  //Fungsi ini dipanggil setelah modal dikonfirmasi
  const handleConfirmSelection = (guestDetails) => {
    if (!tableForSelection) return;

    // 1. Panggil fungsi dari konteks untuk menyimpan info awal ke "draftOrder"
    startDraftOrder(tableForSelection, guestDetails);

    // 2. Tutup modal
    setIsModalOpen(false);
    setTableForSelection(null);

    // 3. Arahkan kasir ke halaman POS untuk mengisi item belanja
    navigate("/pos");
  };

  // Fungsi untuk menangani klik tombol "Bayar" pada meja yang aktif
  const handlePayment = (session) => {
    // Alih-alih alert, kita akan navigasi ke POS dengan membawa data sesi
    console.log(
      "Membawa data sesi ini ke halaman POS untuk pembayaran:",
      session
    );

    // Gunakan `state` dari react-router-dom untuk mengirim data antar halaman
    navigate("/pos", {
      state: {
        orderToPay: session,
      },
    });
  };

  // Hitung tinggi kanvas secara dinamis
  const canvasHeight = useMemo(
    () => calculateCanvasHeight(tableLayout),
    [tableLayout]
  );

  if (loading) return <div className="p-6">Memuat data...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Icon icon="solar:table-2-bold" className="text-blue-600 text-2xl" />
          Daftar Meja
        </h2>

        {/* BARU: Tombol-tombol kontrol layout */}
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <button
                onClick={handleSaveLayout}
                className="bg-green-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-600 text-sm"
              >
                Simpan
              </button>
              <button
                onClick={handleResetLayout}
                className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-yellow-600 text-sm"
              >
                Reset
              </button>
              <button
                onClick={() => setIsEditMode(false)}
                className="bg-gray-200 px-3 py-1.5 rounded-lg font-semibold hover:bg-gray-300 text-sm"
              >
                Selesai
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-600 flex items-center gap-2 text-sm"
            >
              <Icon icon="solar:ruler-pen-bold" />
              Tata Ulang Layout
            </button>
          )}
        </div>
      </div>
      <div className="flex space-x-4 mb-6 border-b overflow-x-auto">
        {dataLantai.map((lantai) => (
          <button
            key={lantai.floor_cd}
            onClick={() => setLantaiAktif(lantai.floor_desc)}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              lantaiAktif === lantai.floor_desc
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-500"
            }`}
          >
            {lantai.floor_desc}
          </button>
        ))}
      </div>

      {/* --- KANVAS UTAMA --- */}
      <div className="mt-6">
        <DndContext
          sensors={sensors} // Gunakan sensor yang sudah dikonfigurasi
          onDragEnd={handleDragEnd}
          modifiers={[restrictToParentElement]}
        >
          <div
            ref={canvasRef}
            className="relative w-full bg-gray-50 border rounded-lg"
            style={{ minHeight: `${canvasHeight}px` }}
          >
            {mejaTerfilter.map((m) => (
              <DraggableTable
                key={m.tbl_cd}
                table={m}
                layout={tableLayout}
                isEditMode={isEditMode}
                activeSession={activeSessions.find(
                  (s) => s.table.tbl_cd === m.tbl_cd
                )}
                onSelect={handleSelectTable}
                onPayment={handlePayment}
                onLayoutChange={handleDragEnd} // onLayoutChange sekarang bisa diganti langsung
              />
            ))}
          </div>
        </DndContext>
      </div>

      <GuestInputModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSelection}
        table={tableForSelection}
        bizType={bizType}
      />
    </div>
  );
}

function DraggableTable({
  table,
  layout,
  isEditMode,
  onLayoutChange,
  ...props
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: table.tbl_cd,
    disabled: !isEditMode,
  });

  const position = layout[table.tbl_cd];
  if (!position) return null;

  // DIUBAH TOTAL: Logika style yang lebih sederhana dan benar
  const style = {
    // Posisi permanen diatur di sini
    left: `${position.x}px`,
    top: `${position.y}px`,
    position: "absolute",
    // 'transform' hanya digunakan untuk pergeseran visual saat di-drag
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TableCard table={table} isEditMode={isEditMode} {...props} />
    </div>
  );
}
