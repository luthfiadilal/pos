import React from "react";

// Komponen untuk satu kartu produk placeholder
const ProductSkeletonCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <div className="animate-pulse flex flex-col">
        {/* Placeholder untuk Gambar */}
        <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
        <div className="flex flex-col items-center text-center">
          {/* Placeholder untuk Info Stok */}
          <div className="w-1/2 h-3 bg-gray-200 rounded-md mb-2"></div>
          {/* Placeholder untuk Nama Produk */}
          <div className="w-3/4 h-4 bg-gray-200 rounded-md mb-3"></div>
          {/* Placeholder untuk Harga */}
          <div className="w-1/3 h-5 bg-gray-300 rounded-md"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Komponen utama yang menampilkan grid skeleton loader.
 * @param {object} props - Props komponen.
 * @param {number} [props.count=12] - Jumlah kartu skeleton yang akan ditampilkan.
 */
const ProductSkeleton = ({ count = 12 }) => {
  return (
    <div className="p-4 lg:col-span-8">
      {/* Placeholder untuk Search Bar */}
      <div className="mb-4 px-2">
        <div className="relative">
          <div className="w-full h-11 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
      {/* Grid untuk Kartu Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 px-2">
        {Array.from({ length: count }).map((_, index) => (
          <ProductSkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
};

export default ProductSkeleton;
