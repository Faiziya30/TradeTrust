// src/pages/Checkout.jsx
import React, { useMemo, useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import PayOptionCard from "../components/checkout/PayOptionCard";
import CreditCheckModal from "../components/checkout/CreditCheckModal";
import { API_BASE_URL, DEFAULT_MERCHANT_ID } from "../config";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { token, customerId, user } = useAuth();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedPayLaterDays, setSelectedPayLaterDays] = useState(null);

  const [cart, setCart] = useState({ items: [], amount: 0 });
  const [profile, setProfile] = useState(null);

  // Load REAL cart from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("cart") || "[]";
    const list = JSON.parse(raw);
    const total = list.reduce((s, c) => s + c.price * c.qty, 0);
    setCart({ items: list, amount: total });
  }, []);

  // Load REAL profile from backend → for score
  useEffect(() => {
    async function loadProfile() {
      if (!token || !customerId) return;
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/customers/${customerId}/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const json = await res.json();
        setProfile(json);
      } catch (err) {
        console.error("Profile load failed:", err);
      }
    }
    loadProfile();
  }, [token, customerId]);

  // Prefer authoritative score from server: latestScore (Score doc) or customer.lastScore
  const profileRawScore =
    profile?.latestScore?.score ?? profile?.customer?.lastScore ?? null;
  const profileScore =
    typeof profileRawScore === "number" ? profileRawScore : null;

  const eligibleInstallment = (profileScore ?? 0) >= 40;
  const eligiblePayLater = (profileScore ?? 0) >= 70;

  // Handle selecting a payment option
  function handleSelect(option) {
    if (option === "installment") {
      setSelectedOption("installment");
      setModalOpen(true);
    } else if (option === "pay_later") {
      // For now default to 30 days; make configurable if needed.
      const days = window.prompt("Enter pay-later term (15, 30, 45):", "30");

      const parsed = Number(days);
      if (![15, 30, 45].includes(parsed)) {
        alert("Invalid pay-later term");
        return;
      }

      setSelectedOption("pay_later");
      setSelectedPayLaterDays(parsed);
      setModalOpen(true);
    } else {
      submitOrder({ paymentOption: "pay_now" });
    }
  }

  // Submit order with correct arguments
  async function submitOrder({
    paymentOption,
    payLaterDays = null,
    installmentCount = 4,
  }) {
    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const body = {
        items: cart.items,
        amount: cart.amount,
        merchantId: DEFAULT_MERCHANT_ID,
        paymentOption,
        installmentConfig: { count: installmentCount },
        payLaterDays,
      };

      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Order failed");

      // Clear cart
      localStorage.removeItem("cart");

      // Go to success page
      navigate("/order-success");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setModalOpen(false);
    }
  }

  // When the credit modal approves
  function onModalApproved() {
    if (selectedOption === "installment") {
      submitOrder({ paymentOption: "installment", installmentCount: 4 });
    }

    if (selectedOption === "pay_later") {
      submitOrder({
        paymentOption: "pay_later",
        payLaterDays: selectedPayLaterDays,
      });
    }
  }

  const installmentPreviewPrice = useMemo(() => {
    const rate =
      profileScore >= 80
        ? 0.03
        : profileScore >= 60
        ? 0.07
        : profileScore >= 40
        ? 0.12
        : 0;

    const total = +(cart.amount * (1 + rate)).toFixed(2);
    const per = +(total / 4).toFixed(2);
    return `${4} × ₹${per} (total ₹${total})`;
  }, [cart.amount, profileScore]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Archivo:wght@700;800;900&display=swap');

        .checkout-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          position: relative;
          overflow: hidden;
        }

        .checkout-page::before {
          content: '';
          position: absolute;
          width: 800px;
          height: 800px;
          top: -400px;
          right: -200px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 20s ease-in-out infinite;
        }

        .checkout-page::after {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          bottom: -300px;
          left: -100px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 15s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -30px); }
          66% { transform: translate(-20px, 20px); }
        }

        h1, h2, h3 {
          font-family: 'Archivo', sans-serif;
        }

        .checkout-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
          position: relative;
          z-index: 1;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 1024px) {
          .checkout-grid {
            grid-template-columns: 5fr 7fr;
          }
        }

        /* Trust Score Card */
        .trust-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          margin-bottom: 1.5rem;
          opacity: 0;
          animation: fadeInLeft 0.8s ease 0.2s forwards;
        }

        .trust-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #94a3b8;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .score-display {
          display: flex;
          align-items: flex-end;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .score-number {
          font-size: 5rem;
          font-weight: 900;
          line-height: 1;
          font-family: 'Archivo', sans-serif;
        }

        .score-high { color: #10b981; }
        .score-medium { color: #f59e0b; }
        .score-low { color: #ef4444; }

        .score-info h3 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .score-info p {
          font-size: 0.875rem;
          color: #64748b;
        }

        .trust-benefits {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .benefit-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #475569;
          font-size: 0.9375rem;
        }

        .benefit-icon {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Order Summary Card */
        .summary-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          opacity: 0;
          animation: fadeInLeft 0.8s ease 0.4s forwards;
        }

        .summary-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.9375rem;
        }

        .summary-item:last-child {
          border-bottom: none;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          margin-top: 1.5rem;
          border-top: 2px solid #e2e8f0;
        }

        .total-label {
          font-size: 1.125rem;
          font-weight: 800;
          color: #1e293b;
        }

        .total-amount {
          font-size: 2rem;
          font-weight: 900;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-family: 'Archivo', sans-serif;
        }

        /* Payment Options Section */
        .payment-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 3rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          opacity: 0;
          animation: fadeInRight 0.8s ease 0.2s forwards;
        }

        .section-label {
          display: inline-block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-weight: 700;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
          color: #3b82f6;
          border-radius: 50px;
          margin-bottom: 1rem;
        }

        .payment-title {
          font-size: 2.5rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.02em;
          margin-bottom: 0.75rem;
        }

        .payment-subtitle {
          color: #64748b;
          font-size: 1.125rem;
          margin-bottom: 2.5rem;
        }

        .payment-options {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* Animations */
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 1024px) {
          .payment-title {
            font-size: 2rem;
          }

          .score-number {
            font-size: 4rem;
          }
        }
      `}</style>

      <div className="checkout-page">
        {/* <Navbar /> */}

        <div className="checkout-container">
          <div className="checkout-grid">
            {/* LEFT — TRUST CONTEXT */}
            <div>
              <div className="trust-card">
                <p className="trust-label">Your Trust Snapshot</p>

                <div className="score-display">
                  <div
                    className={`score-number ${
                      profileScore >= 80
                        ? "score-high"
                        : profileScore >= 50
                        ? "score-medium"
                        : "score-low"
                    }`}
                  >
                    {profileScore}
                  </div>

                  <div className="score-info">
                    <h3>TrustCart Score</h3>
                    <p>Updated in real time</p>
                  </div>
                </div>

                <div className="trust-benefits">
                  <div className="benefit-item">
                    <div className="benefit-icon">✓</div>
                    <span>Higher scores unlock flexible payments</span>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">✓</div>
                    <span>On-time payments increase future limits</span>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">✓</div>
                    <span>No impact on traditional credit</span>
                  </div>
                </div>
              </div>

              {/* ORDER SUMMARY */}
              <div className="summary-card">
                <h2 className="summary-title">Order Summary</h2>

                {cart.items.map((item) => (
                  <div key={item.id} className="summary-item">
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span className="font-semibold">
                      ₹{(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div className="summary-total">
                  <span className="total-label">Total</span>
                  <span className="total-amount">
                    ₹{cart.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT — DECISION ENGINE */}
            <div className="payment-section">
              <span className="section-label">Recommended for you</span>

              <h1 className="payment-title">Choose how you want to pay</h1>

              <p className="payment-subtitle">
                Based on your TrustCart score, here's what you qualify for.
              </p>

              <div className="payment-options">
                <PayOptionCard
                  id="pay_now"
                  title="Pay Now"
                  subtitle="Instant confirmation"
                  eligible={true}
                  details={["No fees", "Fastest checkout"]}
                  priceInfo={`₹${cart.amount.toFixed(2)}`}
                  badge="Best value"
                  onSelect={() => handleSelect("pay_now")}
                />

                <PayOptionCard
                  id="installment"
                  title="Split into 4 payments"
                  subtitle="Build trust as you pay"
                  eligible={eligibleInstallment}
                  details={[
                    "Lower upfront cost",
                    "Improves future eligibility",
                    `Preview: ${installmentPreviewPrice}`,
                  ]}
                  priceInfo={installmentPreviewPrice}
                  onSelect={() => handleSelect("installment")}
                />

                <PayOptionCard
                  id="pay_later"
                  title="Pay later"
                  subtitle="Full amount after 15–45 days"
                  eligible={eligiblePayLater}
                  details={["Short-term flexibility", `Score required: 70+`]}
                  priceInfo={`₹${cart.amount.toFixed(2)} later`}
                  onSelect={() => handleSelect("pay_later")}
                />
              </div>
            </div>
          </div>
        </div>

        <CreditCheckModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          cart={cart}
          paymentOption={selectedOption}
          onApproved={onModalApproved}
        />
      </div>
    </>
  );
}
