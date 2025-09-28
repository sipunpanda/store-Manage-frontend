import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const API = "https://store-manage-backend.onrender.com/api";

export default function Dashboard() {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const [vendorsRes, productsRes] = await Promise.all([
          axios.get(`${API}/vendors`),
          axios.get(`${API}/products`),
        ]);
        setVendors(vendorsRes.data || []);
        setProducts(productsRes.data || []);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { label: "Vendors", value: vendors.length },
    { label: "Products", value: products.length },
    // { label: "Stock Items", value: totalStock },
  ];

  // ✅ Optimized filtering
  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(query));
  }, [products, search]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        📊 Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="flex flex-wrap gap-3 mb-6 justify-start">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 flex-1 min-w-[100px] sm:min-w-[150px] text-center"
          >
            <h2 className="text-xl sm:text-2xl font-extrabold text-blue-600">
              {stat.value}
            </h2>
            <p className="mt-1 text-gray-600 text-sm sm:text-base">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search Products..."
          className="w-full sm:w-1/3 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading / Error */}
      {loading && (
        <p className="text-gray-500 text-center">Loading dashboard...</p>
      )}
      {error && <p className="text-red-600 text-center">{error}</p>}

      {/* Products Preview */}
      {!loading && (
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">
            🛒 Products
          </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
  {filteredProducts.length > 0 ? (
    filteredProducts.map((p) => (
      <div
        key={p._id}
        className="bg-gray-200 rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col border border-gray-200"
      >
        {/* Product Image */}
        <div className="w-full h-36 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
          {p.imageUrl ? (
            <img
              src={
                p.imageUrl.startsWith("http")
                  ? p.imageUrl
                  : `${API}/${p.imageUrl}`
              }
              alt={p.name}
              className="w-full h-full object-contain rounded-lg"
              loading="lazy"
            />
          ) : (
            <span className="text-gray-400 text-sm">No Image</span>
          )}
        </div>

        {/* Name + Quantity Row */}
        <div className="mt-3 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-base truncate">
            {p.name}
          </h3>
          <span className="text-s bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
            {p.category}
          </span>
        </div>

        {/* Price */}
        <div className="mt-3">
          <span className="text-lg sm:text-xl font-bold text-green-600">
            ₹{p.sellingPrice || 0}
          </span>
        </div>
      </div>
    ))
  ) : (
    <p className="col-span-full text-center text-gray-500 mt-2 text-sm">
      No products found
    </p>
  )}
</div>

        </div>
      )}
    </div>
  );
}
