import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, isAuthenticated, isCustomer, isMerchant, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        
        :root {
          --nav-height: 80px;
          --primary: #2563eb;
          --primary-dark: #1e40af;
          --glass-bg: rgba(255, 255, 255, 0.8);
          --glass-border: rgba(255, 255, 255, 0.3);
        }

        .navbar-container {
          font-family: 'DM Sans', sans-serif;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .navbar-container.scrolled {
          backdrop-filter: blur(20px) saturate(180%);
          background: var(--glass-bg);
          border-bottom: 1px solid var(--glass-border);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        }

        .navbar-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          height: var(--nav-height);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          font-family: 'Syne', sans-serif;
          font-size: 1.625rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
          transition: all 0.3s ease;
        }

        .logo::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 3px;
          background: linear-gradient(90deg, #2563eb, #7c3aed);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 2px;
        }

        .logo:hover::after {
          width: 100%;
        }

        .nav-links {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .nav-link {
          position: relative;
          padding: 0.625rem 1.125rem;
          font-size: 0.9375rem;
          font-weight: 500;
          color: #374151;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 10px;
          overflow: hidden;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          border-radius: 10px;
          z-index: -1;
        }

        .nav-link:hover {
          color: #2563eb;
          transform: translateY(-1px);
        }

        .nav-link:hover::before {
          opacity: 1;
        }

        .nav-link:active {
          transform: translateY(0);
        }

        .btn-primary {
          position: relative;
          padding: 0.75rem 1.75rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
          border-radius: 12px;
          border: none;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.25);
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.6s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(37, 99, 235, 0.35);
          background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-logout {
          padding: 0.625rem 1.125rem;
          font-size: 0.9375rem;
          font-weight: 500;
          color: #ef4444;
          background: transparent;
          border: 1.5px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .btn-logout:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.4);
          transform: translateY(-1px);
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 100%);
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #2563eb;
          animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .nav-divider {
          width: 1px;
          height: 24px;
          background: linear-gradient(180deg, transparent, rgba(0,0,0,0.1), transparent);
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          
          .navbar-inner {
            padding: 0 1.5rem;
          }
        }

        /* Stagger animation for nav items */
        .nav-link:nth-child(1) { animation: fadeInUp 0.5s ease 0.1s both; }
        .nav-link:nth-child(2) { animation: fadeInUp 0.5s ease 0.2s both; }
        .nav-link:nth-child(3) { animation: fadeInUp 0.5s ease 0.3s both; }
        .nav-link:nth-child(4) { animation: fadeInUp 0.5s ease 0.4s both; }
        .nav-link:nth-child(5) { animation: fadeInUp 0.5s ease 0.5s both; }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <nav className={`navbar-container ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-inner">
          <Link to="/" className="logo">
            TrustCart AI
          </Link>

          {/* PUBLIC */}
          {!isAuthenticated && (
            <div className="nav-links">
              <Link to="/#features" className="nav-link">
                Features
              </Link>
              <Link to="/#merchants" className="nav-link">
                Merchants
              </Link>
              <div className="nav-divider" />
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="btn-primary">
                Get Started
              </Link>
            </div>
          )}

          {/* CUSTOMER */}
          {isCustomer && (
            <div className="nav-links">
              <div className="user-badge">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    fill="currentColor"
                    fillOpacity="0.2"
                  />
                  <circle cx="8" cy="6" r="2.5" fill="currentColor" />
                  <path
                    d="M3 13.5C3 11.5 5 10 8 10C11 10 13 11.5 13 13.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Customer
              </div>
              <Link to="/products" className="nav-link">
                Shop
              </Link>
              <Link to="/cart" className="nav-link">
                Cart
              </Link>
              <Link to="/profile" className="nav-link">
                Credit Profile
              </Link>
              <button onClick={logout} className="btn-logout">
                Logout
              </button>
            </div>
          )}

          {/* MERCHANT */}
          {isMerchant && (
            <div className="nav-links">
              <div className="user-badge">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="2"
                    y="3"
                    width="12"
                    height="10"
                    rx="2"
                    fill="currentColor"
                    fillOpacity="0.2"
                  />
                  <path
                    d="M2 6H14M5 9H7M9 9H11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Merchant
              </div>
              <Link to="/merchant/dashboard" className="nav-link">
                Dashboard
              </Link>
              <button onClick={logout} className="btn-logout">
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div style={{ height: "var(--nav-height)" }} />
    </>
  );
}
