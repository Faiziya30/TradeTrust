// client/src/api/orders.js
import { API_BASE_URL, DEFAULT_MERCHANT_ID } from "../config";

placeOrder({
  token,
  items,
  amount,
  merchantId = DEFAULT_MERCHANT_ID,
}) {
  const res = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items, amount, merchantId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Order failed");
  return json;
}
