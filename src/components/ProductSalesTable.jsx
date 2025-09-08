import React from "react";

const formatRupiah = (value) => {
  return new Intl.NumberFormat({
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const ProductSalesTable = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Monthly Sales by Product
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600">
              <th className="p-3 font-semibold rounded-l-lg">Product Name</th>
              <th className="p-3 font-semibold">Monthly Qty</th>
              <th className="p-3 font-semibold">Monthly Revenue</th>
              <th className="p-3 font-semibold rounded-r-lg">Avg Price</th>
            </tr>
          </thead>
          <tbody>
            {/* DIUBAH: Sesuaikan nama properti dengan respons API */}
            {data.map((product) => (
              <tr
                key={product.product_cd} // Gunakan ID unik dari data
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="p-3 font-medium text-gray-800">
                  {product.product_nm}
                </td>
                <td className="p-3 text-gray-600">
                  {product.total_quantity} items
                </td>
                <td className="p-3 text-gray-600">
                  {formatRupiah(product.total_sales_amount)}
                </td>
                <td className="p-3 text-gray-600">
                  {/* Kalkulasi harga rata-rata */}
                  {formatRupiah(
                    product.total_quantity > 0
                      ? product.total_sales_amount / product.total_quantity
                      : 0
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductSalesTable;
