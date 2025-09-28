import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";

const API = "https://store-manage-backend.onrender.com/api";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // ✅ Fetch Vendors
  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API}/vendors`);
      setVendors(res.data || []);
    } catch (err) {
      setError("Failed to load vendors. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // ✅ Add / Update Vendor
  const handleAdd = async () => {
    if (!name.trim()) return alert("Enter name");
    try {
      setProcessing(true);
      if (editId) {
        await axios.put(`${API}/vendors/${editId}`, { name });
        setEditId(null);
      } else {
        await axios.post(`${API}/vendors`, { name });
      }
      setName("");
      fetchVendors();
    } catch {
      alert("Error saving vendor");
    } finally {
      setProcessing(false);
    }
  };

  // ✅ Edit Vendor
  const handleEdit = (vendor) => {
    setName(vendor.name);
    setEditId(vendor._id);
  };

  // ✅ Delete Vendor
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      setProcessing(true);
      await axios.delete(`${API}/vendors/${id}`);
      fetchVendors();
    } catch {
      alert("Error deleting vendor");
    } finally {
      setProcessing(false);
    }
  };

  // ✅ Optimized Filtering
  const filteredVendors = useMemo(() => {
    const query = search.toLowerCase();
    return vendors.filter((v) => v.name.toLowerCase().includes(query));
  }, [vendors, search]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🏷️ Vendors</h1>

      {/* Add / Edit Vendor Form */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          placeholder="Vendor Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          disabled={processing}
          className={`px-4 py-2 rounded-lg text-white ${
            editId
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-blue-600 hover:bg-blue-700"
          } transition disabled:opacity-50`}
        >
          {processing
            ? "Processing..."
            : editId
            ? "Update Vendor"
            : "Add Vendor"}
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search Vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-gray-500">Loading vendors...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Vendors Grid */}
      {!loading && filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredVendors.map((v) => (
            <div
              key={v._id}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center border border-gray-100 hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold text-gray-800 truncate w-full">
                {v.name}
              </h2>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEdit(v)}
                  disabled={processing}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(v._id)}
                  disabled={processing}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <p className="text-center text-gray-500 mt-4">No vendors found</p>
        )
      )}
    </div>
  );
}
