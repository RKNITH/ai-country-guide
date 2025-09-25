import React, { useState } from "react";
import { FaGlobeAmericas } from "react-icons/fa";

const App = () => {
  const [country, setCountry] = useState("");
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckCountry = async () => {
    if (!country.trim()) {
      alert("Please enter a country name!");
      return;
    }

    setIsLoading(true);
    setInfo(null);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get-country`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country }),
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setInfo(data.info);
      }
    } catch (err) {
      console.error("Failed to fetch country info:", err);
      setError("Oops! Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Utility: format details into numbered list
  const formatDetails = (text) => {
    const lines = text.split("\n").filter((line) => line.trim() !== "");

    return lines.map((line, idx) => {
      const [label, ...rest] = line.split(":");
      const value = rest.join(":").trim();

      return (
        <li key={idx} className="mb-2 leading-relaxed">
          <span className="font-semibold text-blue-300"> {label}:</span>{" "}
          <span className="text-yellow-200">{value}</span>
        </li>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-purple-900 to-black text-white flex flex-col items-center p-6">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center my-8">
          <h1 className="text-5xl font-bold text-yellow-400 flex items-center justify-center gap-3">
            <FaGlobeAmericas className="animate-pulse" />
            AI Country Explorer
          </h1>
          <p className="text-lg mt-2 text-gray-300">
            Type a valid country name to discover everything about it.
          </p>
        </header>

        <main>
          <div className="bg-white/10 p-6 rounded-2xl shadow-lg backdrop-blur-md border border-yellow-400/30">
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Example: India, Japan, Brazil..."
              className="w-full p-4 rounded-xl bg-black/50 text-yellow-300 placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />

            <button
              onClick={handleCheckCountry}
              disabled={isLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 text-xl font-bold bg-yellow-400 text-black py-4 rounded-xl hover:bg-yellow-500 transition-transform transform hover:scale-105 disabled:bg-gray-500"
            >
              {isLoading ? "Loading..." : "Get Country Info"}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-6 bg-red-600/40 border border-red-400 rounded-xl text-center">
              <p className="text-lg font-bold text-red-200">{error}</p>
            </div>
          )}

          {info && (
            <div className="mt-8 bg-white/10 p-8 rounded-2xl shadow-2xl">
              <h2 className="text-3xl font-bold text-center mb-4 text-yellow-300">
                {info.name}
              </h2>

              {info.flag && (
                <div className="flex justify-center mb-6">
                  <img
                    src={info.flag}
                    alt={`${info.name} Flag`}
                    className="w-40 shadow-lg rounded-lg border border-yellow-400"
                  />
                </div>
              )}

              <ol className="list-decimal list-inside space-y-2 text-lg">
                {formatDetails(info.details)}
              </ol>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
