// client/src/api/order.js
import { API_BASE_URL, DEFAULT_MERCHANT_ID } from "../config";

export async function placeOrder({
  token,
  items,
  amount,
  merchantId = DEFAULT_MERCHANT_ID,
  paymentOption = "pay_now",
  installmentConfig = { count: 4 },
  payLaterDays = null,
}) {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items,
      amount,
      merchantId,
      paymentOption,
      installmentConfig,
      payLaterDays,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Order failed");
  return json;
}
