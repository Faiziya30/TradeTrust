export function getCustomerId() {
  return localStorage.getItem("customerId");
}

export function setCustomerId(id) {
  localStorage.setItem("customerId", id);
}
