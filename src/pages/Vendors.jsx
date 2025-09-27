import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API = 'https://store-manage-backend.onrender.com/api';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');

  const fetchVendors = async () => {
    const res = await axios.get(`${API}/vendors`);
    setVendors(res.data);
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleAdd = async () => {
    if (!name) return alert('Enter name');
    if (editId) {
      await axios.put(`${API}/vendors/${editId}`, { name });
      setEditId(null);
    } else {
      await axios.post(`${API}/vendors`, { name });
    }
    setName('');
    fetchVendors();
  };

  const handleEdit = (vendor) => { setName(vendor.name); setEditId(vendor._id); };
  const handleDelete = async (id) => { await axios.delete(`${API}/vendors/${id}`); fetchVendors(); };

  const filteredVendors = vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));

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
          className={`px-4 py-2 rounded-lg text-white ${
            editId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'
          } transition`}
        >
          {editId ? 'Update Vendor' : 'Add Vendor'}
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

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((v) => (
            <div
              key={v._id}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center border border-gray-100 hover:shadow-lg transition"
            >
              <h2 className="text-lg font-semibold text-gray-800 truncate w-full">{v.name}</h2>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleEdit(v)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(v._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 mt-4">No vendors found</p>
        )}
      </div>
    </div>
  );
}
