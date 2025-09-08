import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { getProducts } from "../services/product";
import { getToppings } from "../services/topping";
import { useAuth } from "../contexts/AuthContext";

const SortIcon = ({ direction }) => {
  if (!direction) return null;
  return (
    <Icon
      icon={
        direction === "ascending"
          ? "solar:arrow-up-bold"
          : "solar:arrow-down-bold"
      }
      className="ml-1 text-gray-600"
    />
  );
};

const ProductManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [productFilters, setProductFilters] = useState({ search: "" });
  const [productSortConfig, setProductSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [toppings, setToppings] = useState([]);
  const [toppingFilters, setToppingFilters] = useState({ search: "" });
  const [toppingSortConfig, setToppingSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [toppingCurrentPage, setToppingCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    if (!user) return;
    const fetchAllData = async () => {
      try {
        // Fetch Products
        const productData = await getProducts(
          user.unit_cd,
          user.company_cd,
          user.branch_cd
        );
        const mappedProducts = productData.map((item) => ({
          id: item.product_cd,
          name: item.product_nm,
          price: item.prices?.[0]?.sales_price || 0,
          category: item.group?.product_grp_desc || "-",
          subCategory: item.subGroup?.product_subgrp_desc || "-",
          stock: item.stock?.ending_qty ?? 0,
          toppings: item.toppings?.map((t) => t.topping_nm) || [],
          is_sold_out: item.is_sold_out,
          is_disc: item.is_disc,
        }));
        setProducts(mappedProducts);

        // Fetch Toppings
        const toppingData = await getToppings(
          user.unit_cd,
          user.company_cd,
          user.branch_cd
        );
        const mappedToppings = toppingData.map((item) => {
          const productName =
            mappedProducts.find((p) => p.id === item.product_cd)?.name ||
            item.product_cd;

          return {
            id: `${item.product_cd}-${item.topping_cd}`,
            name: item.topping_nm,
            product_cd: item.product_cd,
            price: item.toppingPrices?.[0]?.sales_price ?? 0,
            is_free: item.is_free,
            productName: productName,
          };
        });
        setToppings(mappedToppings);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchAllData();
  }, [user]);

  const requestSort = (key, config, setConfig) => {
    let direction = "ascending";
    if (config.key === key && config.direction === "ascending") {
      direction = "descending";
    }
    setConfig({ key, direction });
  };

  const processedProducts = useMemo(() => {
    let sortedItems = [...products];

    // Filtering
    sortedItems = sortedItems.filter((p) =>
      p.name.toLowerCase().includes(productFilters.search.toLowerCase())
    );

    // Sorting
    if (productSortConfig.key !== null) {
      sortedItems.sort((a, b) => {
        if (a[productSortConfig.key] < b[productSortConfig.key]) {
          return productSortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[productSortConfig.key] > b[productSortConfig.key]) {
          return productSortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortedItems;
  }, [products, productFilters, productSortConfig]);

  // Topping
  const processedToppings = useMemo(() => {
    let sortedItems = [...toppings];
    // Filtering
    sortedItems = sortedItems.filter((t) =>
      t.name.toLowerCase().includes(toppingFilters.search.toLowerCase())
    );
    // Sorting
    if (toppingSortConfig.key !== null) {
      sortedItems.sort((a, b) => {
        if (a[toppingSortConfig.key] < b[toppingSortConfig.key]) {
          return toppingSortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[toppingSortConfig.key] > b[toppingSortConfig.key]) {
          return toppingSortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortedItems;
  }, [toppings, toppingFilters, toppingSortConfig]);

  // Pagination Logic
  const paginatedProducts = processedProducts.slice(
    (productCurrentPage - 1) * itemsPerPage,
    productCurrentPage * itemsPerPage
  );
  const productTotalPages = Math.ceil(processedProducts.length / itemsPerPage);

  const paginatedToppings = processedToppings.slice(
    (toppingCurrentPage - 1) * itemsPerPage,
    toppingCurrentPage * itemsPerPage
  );
  const toppingTotalPages = Math.ceil(processedToppings.length / itemsPerPage);

  return (
    <div className="p-4 md:p-6 space-y-8">
      {/* Bagian Tabel Produk */}
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Product List</h2>
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg w-full sm:w-64 mb-6">
          <Icon
            icon="solar:magnifer-linear"
            className="text-gray-500 text-xl"
          />
          <input
            type="text"
            placeholder="Search products..."
            className="bg-transparent outline-none w-full"
            value={productFilters.search}
            onChange={(e) => {
              setProductFilters({ ...productFilters, search: e.target.value });
              setProductCurrentPage(1);
            }}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-left">
                {/* Product Name */}
                <th className="p-3">
                  <button
                    onClick={() =>
                      requestSort(
                        "name",
                        productSortConfig,
                        setProductSortConfig
                      )
                    }
                    className="flex items-center font-semibold"
                  >
                    Product Name{" "}
                    <SortIcon
                      direction={
                        productSortConfig.key === "name"
                          ? productSortConfig.direction
                          : null
                      }
                    />
                  </button>
                </th>
                {/* Price */}
                <th className="p-3">
                  <button
                    onClick={() =>
                      requestSort(
                        "price",
                        productSortConfig,
                        setProductSortConfig
                      )
                    }
                    className="flex items-center font-semibold"
                  >
                    Price{" "}
                    <SortIcon
                      direction={
                        productSortConfig.key === "price"
                          ? productSortConfig.direction
                          : null
                      }
                    />
                  </button>
                </th>
                {/* Stock */}
                <th className="p-3">
                  <button
                    onClick={() =>
                      requestSort(
                        "stock",
                        productSortConfig,
                        setProductSortConfig
                      )
                    }
                    className="flex items-center font-semibold"
                  >
                    Stock{" "}
                    <SortIcon
                      direction={
                        productSortConfig.key === "stock"
                          ? productSortConfig.direction
                          : null
                      }
                    />
                  </button>
                </th>
                {/* Category */}
                <th className="p-3">
                  <button
                    onClick={() =>
                      requestSort(
                        "category",
                        productSortConfig,
                        setProductSortConfig
                      )
                    }
                    className="flex items-center font-semibold"
                  >
                    Category{" "}
                    <SortIcon
                      direction={
                        productSortConfig.key === "category"
                          ? productSortConfig.direction
                          : null
                      }
                    />
                  </button>
                </th>
                {/* Sub Category */}
                <th className="p-3">
                  <button
                    onClick={() =>
                      requestSort(
                        "subCategory",
                        productSortConfig,
                        setProductSortConfig
                      )
                    }
                    className="flex items-center font-semibold"
                  >
                    Sub Category{" "}
                    <SortIcon
                      direction={
                        productSortConfig.key === "subCategory"
                          ? productSortConfig.direction
                          : null
                      }
                    />
                  </button>
                </th>
                {/* Toppings */}
                <th className="p-3">
                  <button
                    onClick={() =>
                      requestSort(
                        "toppings",
                        productSortConfig,
                        setProductSortConfig
                      )
                    }
                    className="flex items-center font-semibold"
                  >
                    Toppings{" "}
                    <SortIcon
                      direction={
                        productSortConfig.key === "toppings"
                          ? productSortConfig.direction
                          : null
                      }
                    />
                  </button>
                </th>
                {/* Sold Out */}
                <th className="p-3">
                  <button
                    onClick={() =>
                      requestSort(
                        "is_sold_out",
                        productSortConfig,
                        setProductSortConfig
                      )
                    }
                    className="flex items-center font-semibold"
                  >
                    Sold Out{" "}
                    <SortIcon
                      direction={
                        productSortConfig.key === "is_sold_out"
                          ? productSortConfig.direction
                          : null
                      }
                    />
                  </button>
                </th>
                {/* Discount */}
                <th className="p-3">
                  <button
                    onClick={() =>
                      requestSort(
                        "is_disc",
                        productSortConfig,
                        setProductSortConfig
                      )
                    }
                    className="flex items-center font-semibold"
                  >
                    Discount{" "}
                    <SortIcon
                      direction={
                        productSortConfig.key === "is_disc"
                          ? productSortConfig.direction
                          : null
                      }
                    />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b">
                  <td className="p-3 font-medium">{product.name}</td>
                  <td className="p-3">{product.price.toLocaleString()}</td>
                  <td
                    className={`p-3 font-medium ${
                      product.stock <= 5 ? "text-red-500" : ""
                    }`}
                  >
                    {product.stock}
                  </td>
                  <td className="p-3">{product.category}</td>
                  <td className="p-3">{product.subCategory}</td>
                  <td className="p-3">{product.toppings?.join(", ") || "-"}</td>
                  <td className="p-3">{product.is_sold_out ? "Yes" : "No"}</td>
                  <td className="p-3">{product.is_disc ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {productTotalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: productTotalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setProductCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md text-sm ${
                  productCurrentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bagian Tabel Topping */}
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Topping List</h2>
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg w-full sm:w-64 mb-6">
          <Icon
            icon="solar:magnifer-linear"
            className="text-gray-500 text-xl"
          />
          <input
            type="text"
            placeholder="Search toppings..."
            className="bg-transparent outline-none w-full"
            value={toppingFilters.search}
            onChange={(e) => {
              setToppingFilters({ ...toppingFilters, search: e.target.value });
              setToppingCurrentPage(1);
            }}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-left">
                {/* Topping Name */}
                <th className="p-3">
                  <button
                    onClick={() =>
                      requestSort(
                        "name",
                        toppingSortConfig,
                        setToppingSortConfig
                      )
                    }
                    className="flex items-center font-semibold"
                  >
                    Topping Name{" "}
                    <SortIcon
                      direction={
                        toppingSortConfig.key === "name"
                          ? toppingSortConfig.direction
                          : null
                      }
                    />
                  </button>
                </th>
                {/* Price */}
                <th className="p-3">
                  <button
                    onClick={() =>
                      requestSort(
                        "price",
                        toppingSortConfig,
                        setToppingSortConfig
                      )
                    }
                    className="flex items-center font-semibold"
                  >
                    Price{" "}
                    <SortIcon
                      direction={
                        toppingSortConfig.key === "price"
                          ? toppingSortConfig.direction
                          : null
                      }
                    />
                  </button>
                </th>
                {/* Linked Product */}
                <th className="p-3">
                  <button
                    onClick={() =>
                      requestSort(
                        "productName",
                        toppingSortConfig,
                        setToppingSortConfig
                      )
                    }
                    className="flex items-center font-semibold"
                  >
                    Linked Product{" "}
                    <SortIcon
                      direction={
                        toppingSortConfig.key === "productName"
                          ? toppingSortConfig.direction
                          : null
                      }
                    />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {paginatedToppings.map((topping) => (
                <tr key={topping.id} className="border-b">
                  <td className="p-3 font-medium">{topping.name}</td>
                  <td className="p-3">
                    {topping.price > 0
                      ? topping.price.toLocaleString()
                      : topping.is_free
                      ? "Free"
                      : "-"}
                  </td>
                  <td className="p-3">{topping.productName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {toppingTotalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: toppingTotalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setToppingCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md text-sm ${
                  toppingCurrentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
