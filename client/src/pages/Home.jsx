// src/pages/Home.jsx
import { Link } from "react-router-dom";
import HeroSection from "../components/HeroSection";
import { useEffect, useRef } from "react";

const VALUE_PROPS = [
  {
    title: "Unified trust graph",
    description:
      "Blend behavioral, transactional, and identity signals to approve more good shoppers instantly.",
  },
  {
    title: "Explainable decisions",
    description:
      "Every score ships with human-readable factors so customers and merchants understand the why.",
  },
  {
    title: "Real-time automation",
    description:
      "Trigger notifications, Score Copilot nudges, and merchant rules the moment a risk shifts.",
  },
];

const STEPS = [
  {
    title: "Shop & enroll",
    body: "Customers browse your catalog, sign in, and consent to credit insights at checkout.",
  },
  {
    title: "Score & decide",
    body: "TrustCart runs the scoring engine, applies merchant policies, and enables Pay Now/Later.",
  },
  {
    title: "Delight & retain",
    body: "Installment schedules, boosters, and Score Copilot keep customers growing their limit.",
  },
];

export default function Home() {
  const observerRef = useRef(null);

  useEffect(() => {
    // Import Google Fonts
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".scroll-fade").forEach((el) => {
      observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <>
      <style>{`
        * {
          font-family: 'Manrope', sans-serif;
        }

        h1, h2, h3 {
          font-family: 'Archivo', sans-serif;
        }

        .home-container {
          background: #ffffff;
          overflow-x: hidden;
        }

        /* Scroll animations */
        .scroll-fade {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .scroll-fade.animate-in {
          opacity: 1;
          transform: translateY(0);
        }

        .scroll-fade:nth-child(1) { transition-delay: 0s; }
        .scroll-fade:nth-child(2) { transition-delay: 0.1s; }
        .scroll-fade:nth-child(3) { transition-delay: 0.2s; }

        /* Trust section with gradient mesh background */
        .trust-section {
          position: relative;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
          overflow: hidden;
        }

        .trust-section::before {
          content: '';
          position: absolute;
          width: 800px;
          height: 800px;
          top: -400px;
          right: -200px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 20s ease-in-out infinite;
        }

        .trust-section::after {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          bottom: -300px;
          left: -100px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 15s ease-in-out infinite reverse;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }

        /* Feature cards with hover effects */
        .feature-card {
          position: relative;
          background: white;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.06);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .feature-card:hover::before {
          transform: scaleX(1);
        }

        /* How it works cards */
        .step-card {
          position: relative;
          background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
          border-radius: 24px;
          padding: 2.5rem;
          border: 1px solid rgba(0, 0, 0, 0.06);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .step-card::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.03) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .step-card:hover::after {
          opacity: 1;
        }

        .step-card:hover {
          transform: translateY(-4px);
          background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
          border-color: rgba(59, 130, 246, 0.15);
        }

        .step-number {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #94a3b8;
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(148, 163, 184, 0.1);
          border-radius: 50px;
          transition: all 0.3s ease;
        }

        .step-card:hover .step-number {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          transform: scale(1.05);
        }

        /* Merchant section with asymmetric layout */
        .merchant-section {
          background: white;
        }

        .merchant-kpi-card {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 28px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }

        .merchant-kpi-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }

        .kpi-number {
          font-size: 4rem;
          font-weight: 900;
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-top: 0.5rem;
        }

        /* CTA section with gradient background */
        .cta-section {
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          border-radius: 40px;
          margin: 0 1rem;
          position: relative;
          overflow: hidden;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 20s ease-in-out infinite;
        }

        .cta-section::after {
          content: '';
          position: absolute;
          bottom: -50%;
          right: -10%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          animation: float 15s ease-in-out infinite reverse;
        }

        .cta-button {
          position: relative;
          padding: 1.25rem 2.5rem;
          font-size: 1.125rem;
          font-weight: 700;
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-block;
          overflow: hidden;
        }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
        }

        .cta-button:hover::before {
          width: 300px;
          height: 300px;
        }

        .cta-button:hover {
          transform: translateY(-4px);
        }

        .cta-button-primary {
          background: white;
          color: #2563eb;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .cta-button-primary:hover {
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }

        .cta-button-secondary {
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .cta-button-secondary:hover {
          border-color: rgba(255, 255, 255, 0.6);
          background: rgba(255, 255, 255, 0.05);
        }

        /* Section headers */
        .section-label {
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #3b82f6;
          display: inline-block;
          padding: 0.5rem 1.25rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
          border-radius: 50px;
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: 3.5rem;
          font-weight: 900;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #0f172a;
          margin-top: 0.75rem;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .section-title {
            font-size: 2.5rem;
          }
          
          .kpi-number {
            font-size: 3rem;
          }

          .cta-button {
            padding: 1rem 2rem;
            font-size: 1rem;
          }
        }

        /* Add subtle grain texture */
        .grain-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.03;
          z-index: 1000;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className="home-container">
        <div className="grain-overlay" />

        <HeroSection />

        {/* Trust Section */}
        <section className="trust-section py-32 relative">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 scroll-fade">
              <span className="section-label">Why TrustCart</span>
              <h2 className="section-title">Built on trust, not tricks</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Explainable by design",
                  body: "Customers always know why they were approved or denied.",
                  icon: "🎯",
                },
                {
                  title: "Real-time decisions",
                  body: "Scores update the moment behavior changes — even at checkout.",
                  icon: "⚡",
                },
                {
                  title: "Aligned incentives",
                  body: "Good customers get rewarded. Bad actors get filtered naturally.",
                  icon: "🤝",
                },
              ].map((f) => (
                <div key={f.title} className="feature-card scroll-fade">
                  <div className="text-5xl mb-4">{f.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 mt-4 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16 scroll-fade">
              <span className="section-label">How it works</span>
              <h2 className="section-title">Credit decisions, done right</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Observe behavior",
                  body: "We track real shopping behavior — payments, returns, consistency — not guesses.",
                },
                {
                  step: "02",
                  title: "Explain the score",
                  body: "Every score comes with clear reasons. No black boxes. No surprises.",
                },
                {
                  step: "03",
                  title: "Unlock flexibility",
                  body: "Good behavior unlocks pay-later, installments, and higher limits.",
                },
              ].map((item) => (
                <div key={item.step} className="step-card scroll-fade">
                  <span className="step-number">{item.step}</span>
                  <h3 className="text-2xl font-bold mt-6 text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mt-4 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Merchant Section */}
        <section id="merchants" className="merchant-section py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-5 gap-12 items-center">
              <div className="md:col-span-3 scroll-fade">
                <span className="section-label">Merchant workspace</span>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 leading-tight">
                  Decisions, automation, and insights in one console
                </h2>
                <p className="text-gray-600 mt-6 text-lg leading-relaxed">
                  Review high-risk shoppers, monitor approval rates, or let
                  rules auto-approve. Every action syncs with the customer
                  portal and Score Copilot.
                </p>
              </div>

              <div className="md:col-span-2 scroll-fade">
                <div className="merchant-kpi-card">
                  <p className="text-sm text-gray-400 font-semibold uppercase tracking-wide">
                    Live KPIs
                  </p>
                  <div className="kpi-number">92%</div>
                  <p className="text-gray-300 mt-2 text-lg">
                    On-time installments
                  </p>
                  <div className="mt-8 pt-6 border-t border-gray-700/50">
                    <p className="text-xs uppercase text-gray-400 font-semibold tracking-wide mb-3">
                      Automation Rules
                    </p>
                    <p className="font-semibold text-white leading-relaxed">
                      Approve scores &gt; 75 · Require deposit on electronics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32">
          <div className="cta-section py-24 text-white text-center relative">
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-black mb-4">
                Who are you?
              </h2>
              <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
                Join thousands of customers and merchants building trust
                together
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center px-6">
                <Link to="/signup" className="cta-button cta-button-primary">
                  I'm a Customer
                </Link>
                <Link to="/signup" className="cta-button cta-button-secondary">
                  I'm a Merchant
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
