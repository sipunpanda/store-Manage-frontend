// version 4 with image compression and optimized cloudinary URLs
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import ImageUpload from './ImageUpload'; // import new component

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

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/products`);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching products:', err.message);
    }
  }, []);

  // Fetch Vendors
  const fetchVendors = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/vendors`);
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching vendors:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchVendors();
  }, [fetchProducts, fetchVendors]);

  // Handle Image Upload with compression
  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setForm((prev) => ({ ...prev, image: compressedFile }));
      setPreview(URL.createObjectURL(compressedFile));
    } catch (err) {
      console.error('Error compressing image:', err);
    }
  };

  // Submit Product
  const handleSubmit = async () => {
    if (!form.name || !form.sellingPrice || !form.vendor) {
      return alert('Enter name, selling price & vendor');
    }

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

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
    } catch (err) {
      console.error('Error submitting product:', err.message);
    }
  };

  // Edit Product
  const handleEdit = (p) => {
    
    
    setForm({ ...p,vendor:p.vendor._id, image: null });
    setPreview(
      p.imageUrl?.startsWith('http')
        ? p.imageUrl
        : p.imageUrl
          ? `${API}/${p.imageUrl}`
          : null
    );
    setEditId(p._id);
  };

  // Delete Product
  const handleDelete = async (id) => {
    prompt('Are you sure you want to delete this product?');
    try {
      await axios.delete(`${API}/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err.message);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">📦 Products</h1>

      {/* Search Bar */}
      {/* <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search by name or category"
          className="w-full sm:w-1/2 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div> */}
      {/* Search Bar with Voice Search */}
<div className="mb-6 flex items-center gap-2">
  <input
    type="text"
    placeholder="Search Products..."
    className="w-full sm:w-1/3 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  {/* Voice Button */}
  <button
    type="button"
    onClick={() => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech Recognition not supported in this browser.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearch(transcript); // set the recognized text in search
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };
    }}
    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
  >
    🎤
  </button>
</div>


      {/* Form Section */}
      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <input
            className="border rounded-lg p-2 w-full"
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            className="border rounded-lg p-2 w-full"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          />
          <input
            className="border rounded-lg p-2 w-full"
            placeholder="Cost Price"
            type="number"
            value={form.costPrice}
            onChange={(e) => setForm((prev) => ({ ...prev, costPrice: e.target.value }))}
          />
          <input
            className="border rounded-lg p-2 w-full"
            placeholder="Selling Price"
            type="number"
            value={form.sellingPrice}
            required
            onChange={(e) => setForm((prev) => ({ ...prev, sellingPrice: e.target.value }))}
          />
          <select
            className="border rounded-lg p-2 w-full"
            value={form.vendor}
            onChange={(e) => setForm((prev) => ({ ...prev, vendor: e.target.value }))}
            required
          >
            <option value="">Select Vendor</option>
            {vendors.map((v) => (
              <option key={v._id} value={v._id}>
                {v.name}
              </option>
            ))}
          </select>

          {/* Camera / Gallery Upload */}
          <div className="flex flex-col">
            <ImageUpload handleImage={handleImage} />

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-2 w-full h-32 object-cover rounded-lg border"
              />
            )}
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
        >
          {editId ? 'Update Product' : '➕ Add Product'}
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => {
            const cost = parseFloat(p.costPrice) || 0;
            const sell = parseFloat(p.sellingPrice) || 0;
            const profit = sell - cost;
            const profitPercent = cost ? ((profit / cost) * 100).toFixed(1) : 0;

            const imgUrl =
              p.imageUrl?.includes('/upload/')
                ? p.imageUrl.replace('/upload/', '/upload/f_auto,q_auto,w_400,h_400,c_fill/')
                : p.imageUrl || '';

            return (
              <div
                key={p._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 border border-gray-200 overflow-hidden flex flex-col"
              >
                <div className="w-full h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {imgUrl ? (
                    <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <span className="text-gray-400 text-sm">No Image</span>
                  )}
                </div>

                <div className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{p.name}</h3>
                    <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      Qty: {p.category}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <div>
                      <p className="text-green-600 font-bold text-lg sm:text-xl">₹{sell}</p>
                      <p className="text-gray-400 text-sm line-through">₹{cost}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Profit: ₹{profit} ({profitPercent}%)
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-yellow-500 text-white px-6 py-1 rounded hover:bg-yellow-600 transition text-xs"
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
            );
          })
        ) : (
          <p className="col-span-full text-center text-gray-500 mt-4 text-sm">No products found</p>
        )}
      </div>
    </div>
  );
}






// version `3` with better UI and profit calculation

// import React, { useEffect, useState, useCallback, useMemo } from 'react';
// import axios from 'axios';
// import imageCompression from 'browser-image-compression';

// const API = 'https://store-manage-backend.onrender.com/api';

// export default function Products() {
//   const [products, setProducts] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [form, setForm] = useState({
//     name: '',
//     category: '',
//     costPrice: '',
//     sellingPrice: '',
//     vendor: '',
//     image: null,
//   });
//   const [editId, setEditId] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [search, setSearch] = useState('');

//   // Fetch Products
//   const fetchProducts = useCallback(async () => {
//     try {
//       const { data } = await axios.get(`${API}/products`);
//       setProducts(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('Error fetching products:', err.message);
//     }
//   }, []);

//   // Fetch Vendors
//   const fetchVendors = useCallback(async () => {
//     try {
//       const { data } = await axios.get(`${API}/vendors`);
//       setVendors(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('Error fetching vendors:', err.message);
//     }
//   }, []);

//   useEffect(() => {
//     fetchProducts();
//     fetchVendors();
//   }, [fetchProducts, fetchVendors]);

//   // Handle Image Upload with compression
//   const handleImage = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const options = {
//       maxSizeMB: 1,          // max 1MB
//       maxWidthOrHeight: 1024,
//       useWebWorker: true,
//     };

//     try {
//       const compressedFile = await imageCompression(file, options);
//       setForm((prev) => ({ ...prev, image: compressedFile }));
//       setPreview(URL.createObjectURL(compressedFile));
//     } catch (err) {
//       console.error('Error compressing image:', err);
//     }
//   };

//   // Submit Product
//   const handleSubmit = async () => {
//     if (!form.name || !form.sellingPrice || !form.vendor) {
//       return alert('Enter name, selling price & vendor');
//     }

//     try {
//       const data = new FormData();
//       Object.entries(form).forEach(([key, value]) => {
//         if (value) data.append(key, value);
//       });

//       if (editId) {
//         await axios.put(`${API}/products/${editId}`, data, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         setEditId(null);
//       } else {
//         await axios.post(`${API}/products`, data, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       }

//       setForm({
//         name: '',
//         category: '',
//         costPrice: '',
//         sellingPrice: '',
//         vendor: '',
//         image: null,
//       });
//       setPreview(null);
//       fetchProducts();
//     } catch (err) {
//       console.error('Error submitting product:', err.message);
//     }
//   };

//   // Edit Product
//   const handleEdit = (p) => {
//     setForm({ ...p, image: null });
//     setPreview(
//       p.imageUrl?.startsWith('http')
//         ? p.imageUrl
//         : p.imageUrl
//           ? `${API}/${p.imageUrl}`
//           : null
//     );
//     setEditId(p._id);
//   };

//   // Delete Product
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${API}/products/${id}`);
//       fetchProducts();
//     } catch (err) {
//       console.error('Error deleting product:', err.message);
//     }
//   };

//   // Filtered Products
//   const filteredProducts = useMemo(() => {
//     const q = search.toLowerCase();
//     return products.filter(
//       (p) =>
//         p.name?.toLowerCase().includes(q) ||
//         p.category?.toLowerCase().includes(q)
//     );
//   }, [products, search]);

//   return (
//     <div className="p-4 sm:p-6 max-w-7xl mx-auto">
//       <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">📦 Products</h1>

//       {/* Search Bar */}
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="🔍 Search by name or category"
//           className="w-full sm:w-1/2 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       {/* Form Section */}
//       <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//           <input
//             className="border rounded-lg p-2 w-full"
//             placeholder="Product Name"
//             value={form.name}
//             onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
//           />
//           <input
//             className="border rounded-lg p-2 w-full"
//             placeholder="Category"
//             value={form.category}
//             onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
//           />
//           <input
//             className="border rounded-lg p-2 w-full"
//             placeholder="Cost Price"
//             type="number"
//             value={form.costPrice}
//             onChange={(e) => setForm((prev) => ({ ...prev, costPrice: e.target.value }))}
//           />
//           <input
//             className="border rounded-lg p-2 w-full"
//             placeholder="Selling Price"
//             type="number"
//             value={form.sellingPrice}
//             required
//             onChange={(e) => setForm((prev) => ({ ...prev, sellingPrice: e.target.value }))}
//           />
//           <select
//             className="border rounded-lg p-2 w-full"
//             value={form.vendor}
//             onChange={(e) => setForm((prev) => ({ ...prev, vendor: e.target.value }))}
//             required
//           >
//             <option value="">Select Vendor</option>
//             {vendors.map((v) => (
//               <option key={v._id} value={v._id}>
//                 {v.name}
//               </option>
//             ))}
//           </select>

//           <div className="flex flex-col">
//           <input
//   type="file"
//   accept="image/*"
//   capture="environment" // allows camera on mobile, ignored on desktop
//   onChange={handleImage}
//   className="border rounded-lg p-2 w-full"
// />

//             {preview && (
//               <img
//                 src={preview}
//                 alt="Preview"
//                 className="mt-2 w-full h-32 object-cover rounded-lg border"
//               />
//             )}
//           </div>
//         </div>
//         <button
//           onClick={handleSubmit}
//           className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
//         >
//           {editId ? 'Update Product' : '➕ Add Product'}
//         </button>
//       </div>

//       {/* Products Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {filteredProducts.length > 0 ? (
//           filteredProducts.map((p) => {
//             const cost = parseFloat(p.costPrice) || 0;
//             const sell = parseFloat(p.sellingPrice) || 0;
//             const profit = sell - cost;
//             const profitPercent = cost ? ((profit / cost) * 100).toFixed(1) : 0;

//             // Optimized Cloudinary image URL
//             const imgUrl =
//               p.imageUrl?.includes('/upload/')
//                 ? p.imageUrl.replace('/upload/', '/upload/f_auto,q_auto,w_400,h_400,c_fill/')
//                 : p.imageUrl || '';

//             return (
//               <div
//                 key={p._id}
//                 className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 border border-gray-200 overflow-hidden flex flex-col"
//               >
//                 <div className="w-full h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
//                   {imgUrl ? (
//                     <img src={imgUrl} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
//                   ) : (
//                     <span className="text-gray-400 text-sm">No Image</span>
//                   )}
//                 </div>

//                 <div className="p-4 flex flex-col gap-2">
//                   {/* Name + Quantity */}
//                   <div className="flex justify-between items-center">
//                     <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{p.name}</h3>
//                     <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
//                       Qty: {p.category}
//                     </span>
//                   </div>

//                   {/* Prices + Profit */}
//                   <div className="flex justify-between items-center mt-2">
//                     <div>
//                       <p className="text-green-600 font-bold text-lg sm:text-xl">₹{sell}</p>
//                       <p className="text-gray-400 text-sm line-through">₹{cost}</p>
//                     </div>
//                     <div className="text-right">
//                       <span className={`text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//                         Profit: ₹{profit} ({profitPercent}%)
//                       </span>
//                     </div>
//                   </div>

//                   <div className="mt-2 flex space-x-2">
//                     <button
//                       onClick={() => handleEdit(p)}
//                       className="bg-yellow-500 text-white px-6 py-1 rounded hover:bg-yellow-600 transition text-xs"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(p._id)}
//                       className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition text-xs"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <p className="col-span-full text-center text-gray-500 mt-4 text-sm">No products found</p>
//         )}
//       </div>
//     </div>
//   );
// }





// version 2 with pagination and sorting
// import React, { useEffect, useState, useCallback, useMemo } from 'react';
// import axios from 'axios';

// const API = 'https://store-manage-backend.onrender.com/api';

// export default function Products() {
//   const [products, setProducts] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [form, setForm] = useState({
//     name: '',
//     category: '',
//     costPrice: '',
//     sellingPrice: '',
//     vendor: '',
//     image: null,
//   });
//   const [editId, setEditId] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [search, setSearch] = useState('');

//   // ✅ Fetch Products
//   const fetchProducts = useCallback(async () => {
//     try {
//       const { data } = await axios.get(`${API}/products`);
//       setProducts(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('Error fetching products:', err.message);
//     }
//   }, []);

//   // ✅ Fetch Vendors
//   const fetchVendors = useCallback(async () => {
//     try {
//       const { data } = await axios.get(`${API}/vendors`);
//       setVendors(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('Error fetching vendors:', err.message);
//     }
//   }, []);

//   useEffect(() => {
//     fetchProducts();
//     fetchVendors();
//   }, [fetchProducts, fetchVendors]);

//   // ✅ Handle Image Upload
//   const handleImage = (e) => {
//     const file = e.target.files?.[0];
//     setForm((prev) => ({ ...prev, image: file || null }));
//     if (file) setPreview(URL.createObjectURL(file));
//   };

//   // ✅ Submit Product
//   const handleSubmit = async () => {
//     if (!form.name || !form.sellingPrice || !form.vendor) {
//       return alert('Enter name, selling price & vendor');
//     }

//     try {
//       const data = new FormData();
//       Object.entries(form).forEach(([key, value]) => {
//         if (value) data.append(key, value);
//       });

//       if (editId) {
//         await axios.put(`${API}/products/${editId}`, data, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         setEditId(null);
//       } else {
//         await axios.post(`${API}/products`, data, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       }

//       setForm({
//         name: '',
//         category: '',
//         costPrice: '',
//         sellingPrice: '',
//         vendor: '',
//         image: null,
//       });
//       setPreview(null);
//       fetchProducts();
//     } catch (err) {
//       console.error('Error submitting product:', err.message);
//     }
//   };

//   // ✅ Edit Product
//   const handleEdit = (p) => {
//     setForm({ ...p, image: null });
//     setPreview(p.imageUrl?.startsWith('http') ? p.imageUrl : p.imageUrl ? `${API}/${p.imageUrl}` : null);
//     setEditId(p._id);
//   };

//   // ✅ Delete Product
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${API}/products/${id}`);
//       fetchProducts();
//     } catch (err) {
//       console.error('Error deleting product:', err.message);
//     }
//   };

//   // ✅ Memoized Filtered Products
//   const filteredProducts = useMemo(() => {
//     const q = search.toLowerCase();
//     return products.filter(
//       (p) =>
//         p.name?.toLowerCase().includes(q) ||
//         p.category?.toLowerCase().includes(q)
//     );
//   }, [products, search]);

//   return (
//     <div className="p-4 sm:p-6 max-w-7xl mx-auto">
//       <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">📦 Products</h1>

//       {/* Search Bar */}
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="🔍 Search by name or category"
//           className="w-full sm:w-1/2 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       {/* Form Section */}
//       <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//           <input
//             className="border rounded-lg p-2 w-full"
//             placeholder="Product Name"
//             value={form.name}
//             onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
//           />
//           <input
//             className="border rounded-lg p-2 w-full"
//             placeholder="Category"
//             value={form.category}
//             onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
//           />
//           <input
//             className="border rounded-lg p-2 w-full"
//             placeholder="Cost Price"
//             type="number"
//             value={form.costPrice}
//             onChange={(e) => setForm((prev) => ({ ...prev, costPrice: e.target.value }))}
//           />
//           <input
//             className="border rounded-lg p-2 w-full"
//             placeholder="Selling Price"
//             type="number"
//             value={form.sellingPrice}
//             required
//             onChange={(e) => setForm((prev) => ({ ...prev, sellingPrice: e.target.value }))}
//           />
//           <select
//             className="border rounded-lg p-2 w-full"
//             value={form.vendor}
//             onChange={(e) => setForm((prev) => ({ ...prev, vendor: e.target.value }))}
//             required
//           >
//             <option value="">Select Vendor</option>
//             {vendors.map((v) => (
//               <option key={v._id} value={v._id}>
//                 {v.name}
//               </option>
//             ))}
//           </select>

//           <div className="flex flex-col">
//             <input
//               type="file"
//               accept="image/*"
//               capture="environment"
//               onChange={handleImage}
//               className="border rounded-lg p-2 w-full"
//             />
//             {preview && (
//               <img
//                 src={preview}
//                 alt="Preview"
//                 className="mt-2 w-full h-32 object-cover rounded-lg border"
//               />
//             )}
//           </div>
//         </div>
//         <button
//           onClick={handleSubmit}
//           className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
//         >
//           {editId ? 'Update Product' : '➕ Add Product'}
//         </button>
//       </div>

//       {/* Products Grid */}
// <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//   {filteredProducts.length > 0 ? (
//     filteredProducts.map((p) => {
//       const cost = parseFloat(p.costPrice) || 0;
//       const sell = parseFloat(p.sellingPrice) || 0;
//       const profit = sell - cost;
//       const profitPercent = cost ? ((profit / cost) * 100).toFixed(1) : 0;

//       return (
//         <div
//           key={p._id}
//           className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 border border-gray-200 overflow-hidden flex flex-col"
//         >
//           {/* Image */}
//           <div className="w-full h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
//             {p.imageUrl ? (
//               <img
//                 src={
//                   p.imageUrl.startsWith("http")
//                     ? p.imageUrl
//                     : `${API}/${p.imageUrl}`
//                 }
//                 alt={p.name}
//                 className="w-full h-full object-cover"
//                 loading="lazy"
//               />
//             ) : (
//               <span className="text-gray-400 text-sm">No Image</span>
//             )}
//           </div>

//           {/* Content */}
//           <div className="p-4 flex flex-col gap-2">
//             {/* Name + Quantity */}
//             <div className="flex justify-between items-center">
//               <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
//                 {p.name}
//               </h3>
//               <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
//                 Qty: {p.category}
//               </span>
//             </div>

//             {/* Prices */}
//             <div className="flex justify-between items-center mt-2">
//               <div>
//                 <p className="text-green-600 font-bold text-lg sm:text-xl">
//                   ₹{sell}
//                 </p>
//                 <p className="text-gray-400 text-sm">
//                   ₹{cost}
//                 </p>
//               </div>
//               <div className="text-right">
//                 <span
//                   className={`text-sm font-semibold ${
//                     profit >= 0 ? 'text-green-600' : 'text-red-600'
//                   }`}
//                 >
//                   Profit: ₹{profit} ({profitPercent}%)
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       );
//     })
//   ) : (
//     <p className="col-span-full text-center text-gray-500 mt-4 text-sm">
//       No products found
//     </p>
//   )}
// </div>

//     </div>
//   );
// }





//version 1

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const API = 'https://store-manage-backend.onrender.com/api';

// export default function Products() {
//   const [products, setProducts] = useState([]);
//   const [vendors, setVendors] = useState([]);
//   const [form, setForm] = useState({
//     name: '',
//     category: '',
//     costPrice: '',
//     sellingPrice: '',
//     vendor: '',
//     image: null,
//   });
//   const [editId, setEditId] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [search, setSearch] = useState('');

//   const fetchProducts = async () => {
//     const res = await axios.get(`${API}/products`);
//     setProducts(res.data);
//   };

//   const fetchVendors = async () => {
//     const res = await axios.get(`${API}/vendors`);
//     setVendors(res.data);
//   };

//   useEffect(() => {
//     fetchProducts();
//     fetchVendors();
//   }, []);

//   const handleImage = (e) => {
//     const file = e.target.files[0];
//     setForm({ ...form, image: file });
//     if (file) setPreview(URL.createObjectURL(file));
//   };

//   const handleSubmit = async () => {
//     if (!form.name || !form.sellingPrice || !form.vendor) return alert('Enter name, selling price & vendor');
//     const data = new FormData();
//     for (let key in form) if (form[key]) data.append(key, form[key]);

//     if (editId) {
//       await axios.put(`${API}/products/${editId}`, data, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       setEditId(null);
//     } else {
//       await axios.post(`${API}/products`, data, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//     }
//     setForm({
//       name: '',
//       category: '',
//       costPrice: '',
//       sellingPrice: '',
//       vendor: '',
//       image: null,
//     });
//     setPreview(null);
//     fetchProducts();
//   };

//   const handleEdit = (p) => {
//     setForm({ ...p, image: null });
//     setPreview(p.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : `${API}/${p.imageUrl}`) : null);
//     setEditId(p._id);
//   };

//   const handleDelete = async (id) => {
//     await axios.delete(`${API}/products/${id}`);
//     fetchProducts();
//   };

//   // Filtered products based on search
//   const filteredProducts = products.filter((p) =>
//     p.name.toLowerCase().includes(search.toLowerCase()) ||
//     p.category.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="p-4 sm:p-6 max-w-7xl mx-auto">
//       <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Products</h1>

//       {/* Search Bar */}
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Search by name or category"
//           className="w-full sm:w-1/2 border rounded p-2"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//       </div>

//       {/* Form Section */}
//       <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//           <input
//             className="border rounded p-2 w-full"
//             placeholder="Name"
//             value={form.name}
//             onChange={(e) => setForm({ ...form, name: e.target.value })}
//           />
//           <input
//             className="border rounded p-2 w-full"
//             placeholder="Category"
//             value={form.category}
//             onChange={(e) => setForm({ ...form, category: e.target.value })}
//           />
//           <input
//             className="border rounded p-2 w-full"
//             placeholder="Cost Price"
//             type="number"
//             value={form.costPrice}
//             onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
//           />
//           <input
//             className="border rounded p-2 w-full"
//             placeholder="Selling Price"
//             type="number"
//             value={form.sellingPrice}
//             required={true}
//             onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
//           />
//           <select
//             className="border rounded p-2 w-full"
//             value={form.vendor}
//             onChange={(e) => setForm({ ...form, vendor: e.target.value })}
//             required={true}
//           >
//             <option value="">Select Vendor</option>
//             {vendors.map((v) => (
//               <option key={v._id} value={v._id}>
//                 {v.name}
//               </option>
//             ))}
//           </select>

//           <div className="flex flex-col">
//             <input
//               type="file"
//               accept="image/*"
//               capture="environment"
//               onChange={handleImage}
//               className="border rounded p-2 w-full"
//             />
//             {preview && (
//               <img
//                 src={preview}
//                 alt="Preview"
//                 className="mt-2 w-full h-32 object-cover rounded"
//               />
//             )}
//           </div>
//         </div>
//         <button
//           onClick={handleSubmit}
//           className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
//         >
//           {editId ? 'Update Product' : 'Add Product'}
//         </button>
//       </div>

//       {/* Products Grid */}
//       <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//         {filteredProducts.map((p) => (
//           <div
//             key={p._id}
//             className="bg-white shadow rounded-lg overflow-hidden border hover:shadow-lg transition text-sm"
//           >
//             {p.imageUrl ? (
//               <img
//                 src={p.imageUrl.startsWith('http') ? p.imageUrl : `${API}/${p.imageUrl}`}
//                 alt={p.name}
//                 className="w-full h-32 sm:h-40 object-cover"
//               />
//             ) : (
//               <div className="w-full h-32 sm:h-40 bg-gray-200 flex items-center justify-center text-gray-500">
//                 No Image
//               </div>
//             )}
//             <div className="p-3">
//               <h2 className="font-semibold text-gray-800">{p.name}</h2>
//               <p className="text-gray-600 truncate">{p.category}</p>
//               <p className="text-gray-500 text-xs">
//                 Vendor: {p.vendor?.name || 'No Vendor'}
//               </p>
//               <div className="mt-2 flex justify-between items-center">
//                 <span className="text-green-600 font-bold text-sm">
//                   ₹{p.sellingPrice}
//                 </span>
//                 <span className="text-gray-400 line-through text-xs">
//                   ₹{p.costPrice}
//                 </span>
//               </div>
//               <div className="mt-2 flex space-x-2">
//                 <button
//                   onClick={() => handleEdit(p)}
//                   className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition text-xs"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(p._id)}
//                   className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition text-xs"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//         {filteredProducts.length === 0 && (
//           <p className="col-span-full text-center text-gray-500 mt-4">No products found</p>
//         )}
//       </div>
//     </div>
//   );
// }
