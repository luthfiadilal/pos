import { useState } from "react";
import { Icon } from "@iconify/react";

const OrderOnlineOverview = () => {
  // Sample order data
  const [orders, setOrders] = useState([
    {
      id: 105,
      product: "MANDARIN",
      unitPrice: 27500,
      quantity: 2,
      amount: 55000,
      time: "12:40",
      date: "2023-06-15",
      orderBy: "Gojek",
    },
    {
      id: 104,
      product: "BLACK GRAPE",
      unitPrice: 24200,
      quantity: 1,
      amount: 24200,
      time: "12:38",
      date: "2023-06-15",
      orderBy: "Grab",
    },
    {
      id: 103,
      product: "BLUEBERRY",
      unitPrice: 24200,
      quantity: 3,
      amount: 72600,
      time: "12:35",
      date: "2023-06-15",
      orderBy: "Maxim",
    },
    {
      id: 102,
      product: "TOMATO",
      unitPrice: 25300,
      quantity: 1,
      amount: 25300,
      time: "12:30",
      date: "2023-06-15",
      orderBy: "Gojek",
    },
    {
      id: 101,
      product: "STRAWBERRY",
      unitPrice: 44000,
      quantity: 1,
      amount: 44000,
      time: "12:10",
      date: "2023-06-15",
      orderBy: "Grab",
    },
    // Additional sample data for different dates
    {
      id: 100,
      product: "APPLE",
      unitPrice: 30000,
      quantity: 2,
      amount: 60000,
      time: "11:45",
      date: "2023-06-14",
      orderBy: "Shoppe Food",
    },
    {
      id: 99,
      product: "ORANGE",
      unitPrice: 28000,
      quantity: 1,
      amount: 28000,
      time: "11:30",
      date: "2023-06-14",
      orderBy: "Maxim",
    },
  ]);

  // Filter state
  const [filters, setFilters] = useState({
    day: "",
    month: "",
    year: "",
  });

  // Get current date for default filter values
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0");
  const currentDay = String(currentDate.getDate()).padStart(2, "0");

  // Filter orders based on selected date filters
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.date);
    const orderYear = orderDate.getFullYear();
    const orderMonth = String(orderDate.getMonth() + 1).padStart(2, "0");
    const orderDay = String(orderDate.getDate()).padStart(2, "0");

    return (
      (!filters.year || orderYear.toString() === filters.year) &&
      (!filters.month || orderMonth === filters.month) &&
      (!filters.day || orderDay === filters.day)
    );
  });

  // Calculate totals
  const totalQty = filteredOrders.reduce(
    (sum, order) => sum + order.quantity,
    0
  );
  const totalAmount = filteredOrders.reduce(
    (sum, order) => sum + order.amount,
    0
  );

  // Generate year options (last 5 years)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Generate month options
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, "0"),
    name: new Date(0, i).toLocaleString("default", { month: "long" }),
  }));

  // Generate day options based on selected month and year
  const getDayOptions = () => {
    if (!filters.month || !filters.year)
      return Array.from({ length: 31 }, (_, i) => i + 1);

    const daysInMonth = new Date(filters.year, filters.month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  return (
    <div className="p-6 bg-white ">
      <h1 className="text-2xl font-bold mb-6">Today's Order Overview</h1>

      {/* Date Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="font-medium">Year:</label>
          <select
            className="bg-gray-100 border-none rounded-lg p-2 outline-none"
            value={filters.year}
            onChange={(e) =>
              setFilters({
                ...filters,
                year: e.target.value,
                month: "",
                day: "",
              })
            }
          >
            <option value="">All Years</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium">Month:</label>
          <select
            className="bg-gray-100 border-none rounded-lg p-2 outline-none"
            value={filters.month}
            onChange={(e) =>
              setFilters({ ...filters, month: e.target.value, day: "" })
            }
            disabled={!filters.year}
          >
            <option value="">All Months</option>
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium">Day:</label>
          <select
            className="bg-gray-100 border-none rounded-lg p-2 outline-none"
            value={filters.day}
            onChange={(e) =>
              setFilters({ ...filters, day: e.target.value.padStart(2, "0") })
            }
            disabled={!filters.month}
          >
            <option value="">All Days</option>
            {getDayOptions().map((day) => (
              <option key={day} value={String(day).padStart(2, "0")}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() =>
            setFilters({
              day: currentDay,
              month: currentMonth,
              year: currentYear.toString(),
            })
          }
          className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200"
        >
          Today
        </button>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 rounded-l-lg">Order No</th>
              <th className="p-3">Order By</th>
              <th className="p-3">Product</th>
              <th className="p-3">Unit Price</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Amount</th>
              <th className="p-3 rounded-r-lg">Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="p-3">{order.id}</td>
                  <td className="p-3">{order.orderBy}</td>
                  <td className="p-3 font-medium">{order.product}</td>
                  <td className="p-3">{order.unitPrice.toLocaleString()}</td>
                  <td className="p-3">{order.quantity}</td>
                  <td className="p-3">{order.amount.toLocaleString()}</td>
                  <td className="p-3">{order.time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No orders found for the selected date
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-4 flex justify-end gap-8">
        <div className="font-bold">Total QTY: {totalQty}</div>
        <div className="font-bold">
          Total Amount: {totalAmount.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default OrderOnlineOverview;
