import { setCustomerId } from "../utils/customer";
import { API_BASE_URL } from "../config";

export default function CreateCustomer() {
  async function create() {
    const res = await fetch(`${API_BASE_URL}/seed`, {
      method: "POST",
    });
    const data = await res.json();

    setCustomerId(data.customer._id);

    alert("Customer created! ID saved.");
  }

  return (
    <div className="p-8">
      <h1>Create Test Customer</h1>
      <button onClick={create} className="bg-blue-600 text-white p-3 rounded">
        Create Customer & Save ID
      </button>
    </div>
  );
}
