export const formatCartForOrderAPI = (cart) => {
  if (!cart) return [];

  const allUnits = [];

  cart.forEach((item) => {
    for (let i = 0; i < item.qty; i++) {
      const toppingsForThisUnit = item.selectedToppings?.[i] || [];

      const formattedToppings = toppingsForThisUnit
        .filter((toppingName) => toppingName && toppingName !== "Tanpa Topping")
        .map((toppingName) => {
          const toppingDetail = item.availableToppings.find(
            (t) => t.topping_nm === toppingName
          );
          return {
            topping_cd: toppingDetail ? toppingDetail.topping_cd : null,
          };
        })
        .filter((t) => t.topping_cd);

      allUnits.push({
        product_cd: item.id,
        toppings: formattedToppings,
        toppings_key: formattedToppings
          .map((t) => t.topping_cd)
          .sort()
          .join(","),
      });
    }
  });

  const groupedItems = {};

  allUnits.forEach((unit) => {
    const key = `${unit.product_cd}|${unit.toppings_key}`;

    if (!groupedItems[key]) {
      groupedItems[key] = {
        product_cd: unit.product_cd,
        quantity: 1,
        toppings: unit.toppings,
      };
    } else {
      groupedItems[key].quantity += 1;
    }
  });

  return Object.values(groupedItems);
};

// Kita juga bisa memindahkan logika mapping produk ke sini
export const mapProducts = (products) => {
  return products.map((item) => {
    const isSoldOut =
      item.is_sold_out === 1 ||
      item.is_product_stock === 0 ||
      (item.stock && item.stock.ending_qty <= 0);
    const priceInfo =
      item.prices && item.prices.length > 0 ? item.prices[0] : {};
    return {
      id: item.product_cd,
      name: item.product_nm,
      barcode: item.barcode,
      image: item.product_file_img_server,
      stock: item.stock?.ending_qty ?? "N/A",
      isSoldOut: isSoldOut,
      price: priceInfo.sales_price || 0,
      pb1: priceInfo.pb1_amnt || 0,
      ppn: priceInfo.ppn_amnt || 0,
      service: priceInfo.service_amnt || 0,
      effectiveDate: priceInfo.effective_date || "",
      group: item.group ? item.group.product_grp_desc : "Uncategorized",
      subGroup: item.subGroup
        ? item.subGroup.product_subgrp_desc
        : "Uncategorized",
      category:
        item.group && item.subGroup
          ? `${item.group.product_grp_desc} - ${item.subGroup.product_subgrp_desc}`
          : item.group
          ? item.group.product_grp_desc
          : "Uncategorized",
      availableToppings: (item.toppings || []).map((topping) => {
        const toppingPriceInfo =
          topping.toppingPrices && topping.toppingPrices.length > 0
            ? topping.toppingPrices[0]
            : {};
        return {
          ...topping,
          price: toppingPriceInfo.sales_price || 0,
          pb1: toppingPriceInfo.pb1_amnt || 0,
          ppn: toppingPriceInfo.ppn_amnt || 0,
          service: toppingPriceInfo.service_amnt || 0,
        };
      }),
      hasToppings: (item.toppings || []).length > 0,
      discount: 0,
    };
  });
};
