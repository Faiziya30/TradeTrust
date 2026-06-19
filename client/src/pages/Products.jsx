// client/src/pages/Products.jsx
import { useMemo, useState } from "react";
import { PRODUCTS } from "../data/products";
import { useNavigate } from "react-router-dom";

function ProductCard({ product, onAdd }) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border flex flex-col gap-3">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="h-48 w-full object-cover rounded-xl"
        />
        <span className="absolute top-3 left-3 bg-white/90 text-xs font-semibold px-3 py-1 rounded-full">
          {product.category}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
        <span className="text-sm font-medium text-blue-600">
          {product.badge}
        </span>
      </div>
      <p className="text-gray-600 text-sm flex-1">{product.description}</p>
      <div className="text-xs text-gray-500 flex justify-between">
        <span>{product.fulfillment}</span>
        <span>{product.creditHint}</span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t">
        <div>
          <p className="text-xs uppercase text-gray-400">Price</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{product.price.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => onAdd(product)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

export default function Products() {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      return [];
    }
  });
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();

  function addToCart(product) {
    const next = [...cart];
    const idx = next.findIndex((c) => c.id === product.id);
    if (idx === -1) next.push({ ...product, qty: 1 });
    else next[idx].qty++;
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  }

  const categories = useMemo(() => {
    const unique = new Set(PRODUCTS.map((p) => p.category));
    return ["all", ...unique];
  }, []);

  const filteredProducts = PRODUCTS.filter(
    (p) => category === "all" || p.category === category
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase text-blue-600 font-semibold">
            TrustCart marketplace
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Featured catalog</h1>
          <p className="text-gray-500">
            Your score determines whether Pay Later or deposits appear at
            checkout.
          </p>
        </div>
        <button
          onClick={() => navigate("/cart")}
          className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
        >
          View Cart ({cart.reduce((s, c) => s + c.qty, 0)})
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mt-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              category === cat
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {cat === "all" ? "All products" : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={addToCart} />
        ))}
      </div>
    </div>
  );
}
