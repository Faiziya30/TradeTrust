// client/src/pages/CartPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem("cart") || "[]";
    try {
      setCart(JSON.parse(raw));
    } catch {
      setCart([]);
    }
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  function updateQty(id, delta) {
    const next = cart.map((c) =>
      c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c
    );
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  }

  function removeItem(id) {
    const next = cart.filter((c) => c.id !== id);
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  }

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const savings = cart.reduce((s, c) => {
    const originalPrice = c.price * 1.15; // 15% markup as "original"
    return s + (originalPrice - c.price) * c.qty;
  }, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Archivo:wght@700;800;900&display=swap');

        .cart-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 2rem 1rem;
        }

        h1, h2, h3 {
          font-family: 'Archivo', sans-serif;
        }

        .cart-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
          opacity: 0;
          animation: fadeInDown 0.6s ease forwards;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.03em;
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: #64748b;
          font-size: 1.125rem;
        }

        .cart-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 1024px) {
          .cart-grid {
            grid-template-columns: 2fr 1fr;
          }
        }

        /* Cart Items Section */
        .cart-items {
          opacity: 0;
          animation: fadeInUp 0.6s ease 0.2s forwards;
        }

        .cart-item {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          gap: 1.5rem;
          align-items: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
          animation: fadeInUp 0.5s ease forwards;
        }

        .cart-item:nth-child(1) { animation-delay: 0.3s; }
        .cart-item:nth-child(2) { animation-delay: 0.4s; }
        .cart-item:nth-child(3) { animation-delay: 0.5s; }
        .cart-item:nth-child(4) { animation-delay: 0.6s; }
        .cart-item:nth-child(5) { animation-delay: 0.7s; }

        .cart-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .item-image {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 16px;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .item-price {
          color: #3b82f6;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .item-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .qty-control {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #f1f5f9;
          padding: 0.5rem 1rem;
          border-radius: 12px;
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: white;
          color: #475569;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .qty-btn:hover {
          background: #3b82f6;
          color: white;
          transform: scale(1.1);
        }

        .qty-btn:active {
          transform: scale(0.95);
        }

        .qty-display {
          font-weight: 700;
          color: #1e293b;
          min-width: 30px;
          text-align: center;
        }

        .remove-btn {
          padding: 0.625rem 1.25rem;
          border-radius: 10px;
          border: none;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .remove-btn:hover {
          background: #ef4444;
          color: white;
          transform: translateY(-2px);
        }

        /* Summary Card */
        .summary-card {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(0, 0, 0, 0.06);
          position: sticky;
          top: 2rem;
          opacity: 0;
          animation: fadeInUp 0.6s ease 0.4s forwards;
        }

        .summary-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .summary-row:last-child {
          border-bottom: none;
        }

        .summary-label {
          color: #64748b;
          font-weight: 500;
        }

        .summary-value {
          color: #1e293b;
          font-weight: 700;
        }

        .savings-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          color: #16a34a;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-weight: 700;
          margin: 1rem 0;
        }

        .total-row {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 2px solid #f1f5f9;
        }

        .total-label {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .total-value {
          font-size: 2rem;
          font-weight: 900;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .checkout-btn {
          width: 100%;
          padding: 1.25rem;
          margin-top: 1.5rem;
          border-radius: 16px;
          border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .checkout-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
        }

        .checkout-btn:hover::before {
          width: 400px;
          height: 400px;
        }

        .checkout-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4);
        }

        .checkout-btn:active {
          transform: translateY(-2px);
        }

        /* Empty Cart State */
        .empty-cart {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          opacity: 0;
          animation: fadeInUp 0.6s ease 0.2s forwards;
        }

        .empty-icon {
          font-size: 6rem;
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .empty-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.75rem;
        }

        .empty-subtitle {
          color: #64748b;
          font-size: 1.125rem;
          margin-bottom: 2rem;
        }

        .browse-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
        }

        .browse-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 2rem;
          }

          .cart-item {
            flex-direction: column;
            text-align: center;
          }

          .item-controls {
            width: 100%;
            justify-content: center;
          }

          .summary-card {
            position: relative;
            top: 0;
          }
        }
      `}</style>

      <div className="cart-page">
        <div className="cart-container">
          <div className="page-header">
            <h1 className="page-title">Shopping Cart</h1>
            <p className="page-subtitle">
              {cart.length > 0
                ? `${cart.length} item${
                    cart.length > 1 ? "s" : ""
                  } in your cart`
                : "Your cart is empty"}
            </p>
          </div>

          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-icon">🛒</div>
              <h2 className="empty-title">Your cart is empty</h2>
              <p className="empty-subtitle">
                Looks like you haven't added anything yet. Start shopping!
              </p>
              <button
                onClick={() => navigate("/products")}
                className="browse-btn"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Browse Products
              </button>
            </div>
          ) : (
            <div className="cart-grid">
              {/* Cart Items */}
              <div className="cart-items">
                {cart.map((c) => (
                  <div key={c.id} className="cart-item">
                    <img src={c.image} alt={c.name} className="item-image" />

                    <div className="item-details">
                      <h3 className="item-name">{c.name}</h3>
                      <div className="item-price">₹{c.price.toFixed(2)}</div>
                    </div>

                    <div className="item-controls">
                      <div className="qty-control">
                        <button
                          onClick={() => updateQty(c.id, -1)}
                          className="qty-btn"
                        >
                          −
                        </button>
                        <div className="qty-display">{c.qty}</div>
                        <button
                          onClick={() => updateQty(c.id, +1)}
                          className="qty-btn"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(c.id)}
                        className="remove-btn"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Card */}
              <div className="summary-card">
                <h2 className="summary-title">Order Summary</h2>

                <div className="summary-row">
                  <span className="summary-label">
                    Subtotal ({cart.length} items)
                  </span>
                  <span className="summary-value">₹{total.toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span className="summary-label">Delivery</span>
                  <span className="summary-value" style={{ color: "#16a34a" }}>
                    FREE
                  </span>
                </div>

                {savings > 0 && (
                  <div className="savings-badge">
                    <svg
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    You're saving ₹{savings.toFixed(2)}
                  </div>
                )}

                <div className="summary-row total-row">
                  <span className="total-label">Total</span>
                  <span className="total-value">₹{total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="checkout-btn"
                >
                  Proceed to Checkout
                </button>

                <div
                  style={{
                    marginTop: "1.5rem",
                    textAlign: "center",
                    fontSize: "0.875rem",
                    color: "#94a3b8",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{ display: "inline-block", marginRight: "0.5rem" }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Secure checkout powered by TrustCart
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
