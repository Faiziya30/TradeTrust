import { API_BASE_URL } from "../config";

export async function fetchCustomerProfile(token, customerId) {
  const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Profile load failed");
  return data;
}

export async function markNotificationRead(token, customerId, notificationId) {
  const res = await fetch(
    `${API_BASE_URL}/api/customers/${customerId}/notifications/${notificationId}/read`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Unable to update notification");
  }
  return true;
}

export async function updateBoosterTask(token, customerId, key, completed) {
  const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/boosters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ key, completed }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Unable to update booster");
  }
  return data;
}

export async function fetchScoreDetails(token, customerId) {
  const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/score`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Unable to load score details");
  return data.score;
}

