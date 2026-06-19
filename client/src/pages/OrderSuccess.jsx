import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const scoreData = location.state?.score || null;
  const [showConfetti, setShowConfetti] = useState(true);

  const scoreValue = scoreData?.score ?? null;
  const level = scoreData?.level ?? null;
  const reasons = scoreData?.reasons ?? [];

  let scoreColor = "score-medium";
  if (scoreValue >= 80) scoreColor = "score-high";
  else if (scoreValue < 50) scoreColor = "score-low";

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Archivo:wght@700;800;900&display=swap');

        .success-page {
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .success-page::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          top: -300px;
          right: -200px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 15s ease-in-out infinite;
        }

        .success-page::after {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          bottom: -250px;
          left: -150px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 20s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }

        /* Confetti */
        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          background: #fbbf24;
          position: absolute;
          animation: confetti-fall 3s linear forwards;
          z-index: 10;
        }

        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .confetti:nth-child(1) { left: 10%; background: #ef4444; animation-delay: 0s; }
        .confetti:nth-child(2) { left: 20%; background: #3b82f6; animation-delay: 0.2s; }
        .confetti:nth-child(3) { left: 30%; background: #10b981; animation-delay: 0.4s; }
        .confetti:nth-child(4) { left: 40%; background: #f59e0b; animation-delay: 0.6s; }
        .confetti:nth-child(5) { left: 50%; background: #8b5cf6; animation-delay: 0.8s; }
        .confetti:nth-child(6) { left: 60%; background: #ec4899; animation-delay: 1s; }
        .confetti:nth-child(7) { left: 70%; background: #14b8a6; animation-delay: 1.2s; }
        .confetti:nth-child(8) { left: 80%; background: #f97316; animation-delay: 1.4s; }
        .confetti:nth-child(9) { left: 90%; background: #6366f1; animation-delay: 1.6s; }

        h1, h2, h3 {
          font-family: 'Archivo', sans-serif;
        }

        .success-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 32px;
          padding: 3.5rem;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          z-index: 5;
          text-align: center;
          opacity: 0;
          animation: fadeInScale 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .success-icon-wrapper {
          width: 120px;
          height: 120px;
          margin: 0 auto 2rem;
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bounce 1s ease 0.5s;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-20px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-10px); }
        }

        .success-icon {
          font-size: 4rem;
          animation: rotate 0.6s ease 0.8s;
        }

        @keyframes rotate {
          from { transform: rotate(-180deg) scale(0); }
          to { transform: rotate(0deg) scale(1); }
        }

        .success-title {
          font-size: 2.5rem;
          font-weight: 900;
          color: #10b981;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }

        .success-subtitle {
          color: #64748b;
          font-size: 1.125rem;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        /* Score Section */
        .score-section {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 24px;
          padding: 2.5rem;
          margin-bottom: 2rem;
        }

        .score-label {
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .score-display {
          font-size: 5rem;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 0.5rem;
          font-family: 'Archivo', sans-serif;
        }

        .score-high { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .score-medium { 
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .score-low { 
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .score-level {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }

        .score-factors {
          text-align: left;
        }

        .factors-title {
          font-size: 0.875rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .factor-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.875rem;
          background: white;
          border-radius: 12px;
          margin-bottom: 0.75rem;
          border: 1px solid #e2e8f0;
        }

        .factor-icon {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.875rem;
        }

        .factor-content {
          flex: 1;
        }

        .factor-text {
          font-size: 0.9375rem;
          color: #334155;
          line-height: 1.5;
          margin-bottom: 0.25rem;
        }

        .factor-value {
          font-size: 0.8125rem;
          color: #94a3b8;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 2.5rem;
        }

        .btn {
          flex: 1;
          padding: 1.125rem 2rem;
          border-radius: 14px;
          font-size: 1.0625rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          position: relative;
          overflow: hidden;
        }

        .btn::before {
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

        .btn:hover::before {
          width: 400px;
          height: 400px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4);
        }

        .btn-secondary {
          background: white;
          color: #475569;
          border: 2px solid #e2e8f0;
        }

        .btn-secondary:hover {
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .btn:active {
          transform: translateY(0);
        }

        /* Security Badge */
        .security-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .security-icon {
          width: 18px;
          height: 18px;
        }

        @media (max-width: 640px) {
          .success-card {
            padding: 2rem;
          }

          .success-title {
            font-size: 2rem;
          }

          .score-display {
            font-size: 4rem;
          }

          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="success-page">
        {/* Confetti Animation */}
        {showConfetti && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {[...Array(9)].map((_, i) => (
              <div key={i} className="confetti" />
            ))}
          </div>
        )}

        <div className="success-card">
          <div className="success-icon-wrapper">
            <div className="success-icon">🎉</div>
          </div>

          <h1 className="success-title">Order Confirmed!</h1>
          <p className="success-subtitle">
            Your order has been placed successfully. Thank you for shopping with
            TrustCart AI.
          </p>

          {scoreValue != null && (
            <div className="score-section">
              <div className="score-label">Your Updated Score</div>
              <div className={`score-display ${scoreColor}`}>{scoreValue}</div>
              <div className="score-level">{level}</div>

              {reasons.length > 0 && (
                <div className="score-factors">
                  <div className="factors-title">Key Factors</div>
                  {reasons.slice(0, 3).map((r, i) => (
                    <div key={i} className="factor-item">
                      <div className="factor-icon">
                        {i === 0 ? "🎯" : i === 1 ? "📊" : "✨"}
                      </div>
                      <div className="factor-content">
                        <div className="factor-text">{r.text}</div>
                        {r.value && (
                          <div className="factor-value">{r.value}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="action-buttons">
            <button
              onClick={() => navigate("/profile")}
              className="btn btn-secondary"
            >
              View Profile
            </button>
            <button
              onClick={() => navigate("/products")}
              className="btn btn-primary"
            >
              Continue Shopping
            </button>
          </div>

          <div className="security-badge">
            <svg
              className="security-icon"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
            Your transaction is secure and encrypted
          </div>
        </div>
      </div>
    </>
  );
}
