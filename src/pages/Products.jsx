import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'https://store-manage-backend.onrender.com/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({
    name: '',
    category: '',
    costPrice: '',
    sellingPrice: '',
    vendor: '',
    image: null,
  });
  const [editId, setEditId] = useState(null);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    const res = await axios.get(`${API}/products`);
    setProducts(res.data);
  };

  const fetchVendors = async () => {
    const res = await axios.get(`${API}/vendors`);
    setVendors(res.data);
  };

  useEffect(() => {
    fetchProducts();
    fetchVendors();
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.sellingPrice || !form.vendor) return alert('Enter name, selling price & vendor');
    const data = new FormData();
    for (let key in form) if (form[key]) data.append(key, form[key]);

    if (editId) {
      await axios.put(`${API}/products/${editId}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEditId(null);
    } else {
      await axios.post(`${API}/products`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    setForm({
      name: '',
      category: '',
      costPrice: '',
      sellingPrice: '',
      vendor: '',
      image: null,
    });
    setPreview(null);
    fetchProducts();
  };

  const handleEdit = (p) => {
    setForm({ ...p, image: null });
    setPreview(p.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : `${API}/${p.imageUrl}`) : null);
    setEditId(p._id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/products/${id}`);
    fetchProducts();
  };

  // Filtered products based on search
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Products</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or category"
          className="w-full sm:w-1/2 border rounded p-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Form Section */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <input
            className="border rounded p-2 w-full"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border rounded p-2 w-full"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            className="border rounded p-2 w-full"
            placeholder="Cost Price"
            type="number"
            value={form.costPrice}
            onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
          />
          <input
            className="border rounded p-2 w-full"
            placeholder="Selling Price"
            type="number"
            value={form.sellingPrice}
            required={true}
            onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
          />
          <select
            className="border rounded p-2 w-full"
            value={form.vendor}
            onChange={(e) => setForm({ ...form, vendor: e.target.value })}
            required={true}
          >
            <option value="">Select Vendor</option>
            {vendors.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>

          <div className="flex flex-col">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImage}
              className="border rounded p-2 w-full"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-2 w-full h-32 object-cover rounded"
              />
            )}
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
        >
          {editId ? 'Update Product' : 'Add Product'}
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.map((p) => (
          <div
            key={p._id}
            className="bg-white shadow rounded-lg overflow-hidden border hover:shadow-lg transition text-sm"
          >
            {p.imageUrl ? (
              <img
                src={p.imageUrl.startsWith('http') ? p.imageUrl : `${API}/${p.imageUrl}`}
                alt={p.name}
                className="w-full h-32 sm:h-40 object-cover"
              />
            ) : (
              <div className="w-full h-32 sm:h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
            <div className="p-3">
              <h2 className="font-semibold text-gray-800">{p.name}</h2>
              <p className="text-gray-600 truncate">{p.category}</p>
              <p className="text-gray-500 text-xs">
                Vendor: {p.vendor?.name || 'No Vendor'}
              </p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-green-600 font-bold text-sm">
                  ₹{p.sellingPrice}
                </span>
                <span className="text-gray-400 line-through text-xs">
                  ₹{p.costPrice}
                </span>
              </div>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <p className="col-span-full text-center text-gray-500 mt-4">No products found</p>
        )}
      </div>
    </div>
  );
}
