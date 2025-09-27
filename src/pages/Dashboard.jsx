import React, { useEffect, useState } from "react";
import axios from "axios";

const API = 'https://store-manage-backend.onrender.com/api';

export default function Dashboard() {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get(`${API}/vendors`).then((res) => setVendors(res.data));
    axios.get(`${API}/products`).then((res) => setProducts(res.data));
  }, []);

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  const stats = [
    { label: "Vendors", value: vendors.length },
    { label: "Products", value: products.length },
    // { label: "Stock Items", value: totalStock },
  ];

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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

  {/* Products Preview */}
<div>
  <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-4">
    🛒 Products
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {filteredProducts.length > 0 ? (
      filteredProducts.map((p) => (
        <div
          key={p._id}
          className="bg-gray-200 rounded-2xl shadow-md hover:shadow-xl transition p-3 flex flex-col items-center border border-gray-100"
        >
          <div className="w-full h-32 sm:h-36 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden ">
            {p.imageUrl ? (
              <img
                src={
                  p.imageUrl.startsWith("http")
                    ? p.imageUrl
                    : `${API}/${p.imageUrl}`
                }
                alt={p.name}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <span className="text-gray-400 text-sm">No Image</span>
            )}
          </div>

          <h3 className="mt-3 font-bold text-gray-900 text-base sm:text-lg text-center truncate w-full">
            {p.name}
          </h3>
          {/* <p className="text-gray-500 text-xs sm:text-sm mt-1">{p.category}</p> */}

          <div className="mt-2 flex items-center justify-center space-x-2 ">
            <span className="text-lg sm:text-2xl font-extrabold text-green-600">
              ₹{p.sellingPrice || 0}
            </span>
            {/* {p.costPrice && (
              <span className="text-sm sm:text-base line-through text-gray-400">
                ₹{p.costPrice}
              </span>
            )} */}
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

    </div>
  );
}
