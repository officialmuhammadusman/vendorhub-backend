// Total earnings for a vendor across all orders
export const calculateVendorEarnings = (orders, vendorId) => {
  let totalEarnings = 0;
  let totalOrders   = 0;

  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (item.vendor.toString() === vendorId.toString()) {
        totalEarnings += item.price * item.quantity;
        totalOrders++;
      }
    });
  });

  return { totalEarnings, totalOrders };
};

// Monthly earnings grouped for Recharts
export const groupEarningsByMonth = (orders, vendorId) => {
  const monthly = {};

  orders.forEach((order) => {
    const month = new Date(order.createdAt).toLocaleString("default", {
      month: "short", year: "numeric",
    });
    order.items.forEach((item) => {
      if (item.vendor.toString() === vendorId.toString()) {
        if (!monthly[month]) monthly[month] = 0;
        monthly[month] += item.price * item.quantity;
      }
    });
  });

  return Object.entries(monthly).map(([month, earnings]) => ({ month, earnings }));
};