import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-28 text-center">
        <p className="text-sm uppercase tracking-wide text-blue-600 font-semibold">
          E-commerce trust, reimagined
        </p>

        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mt-4">
          Not everyone deserves credit.
          <br />
          <span className="text-blue-600">Now you can prove it.</span>
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-6">
          TrustCart creates a living credit profile for every shopper — using
          real behavior, transparent scoring, and explainable decisions.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/signup"
            className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700"
          >
            Try as a Customer
          </Link>
          <Link
            to="/signup"
            className="px-8 py-4 rounded-2xl border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50"
          >
            I’m a Merchant
          </Link>
        </div>
      </div>
    </section>
  );
}
