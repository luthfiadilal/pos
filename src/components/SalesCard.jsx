import React from "react";

const SalesCard = ({
  title,
  sales_qty,
  sales_amnt,
  pay_cash_amnt,
  pay_bank_amnt,
  pay_debit_amnt,
  pay_credit_amnt,
  pay_other_amnt,
  pay_ewallet_amnt,
  pay_online_amnt,
  transfer_amnt,
}) => {
  const formatCurrency = (value) =>
    value !== null && value !== undefined
      ? `Rp${Number(value).toLocaleString()}`
      : "-";

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex-1">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>

      {/* Summary */}
      <div className="space-y-3 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Sales Qty:</span>
          <span className="font-medium">{sales_qty ?? 0} items</span>
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="text-gray-600 font-semibold">
            Total Sales Amount:
          </span>
          <span className="font-bold">{formatCurrency(sales_amnt)}</span>
        </div>
      </div>

      {/* Breakdown Payment */}
      <div className="space-y-2 text-xs border-t pt-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Cash:</span>
          <span className="font-medium">{formatCurrency(pay_cash_amnt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Bank:</span>
          <span className="font-medium">{formatCurrency(pay_bank_amnt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Debit:</span>
          <span className="font-medium">{formatCurrency(pay_debit_amnt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Credit:</span>
          <span className="font-medium">{formatCurrency(pay_credit_amnt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Other:</span>
          <span className="font-medium">{formatCurrency(pay_other_amnt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">E-Wallet:</span>
          <span className="font-medium">
            {formatCurrency(pay_ewallet_amnt)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Online:</span>
          <span className="font-medium">{formatCurrency(pay_online_amnt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Transfer:</span>
          <span className="font-medium">{formatCurrency(transfer_amnt)}</span>
        </div>
      </div>
    </div>
  );
};

export default SalesCard;
