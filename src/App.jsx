import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Vendors from './pages/Vendors.jsx';
import Products from './pages/Products.jsx';

export default function App() {
  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg transition ${
      isActive
        ? 'bg-blue-600 text-white font-semibold'
        : 'text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <Router>
      {/* Top Navigation */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="w-full max-w-full mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-blue-600">Store Manage</h1>
          <nav className="flex gap-2 sm:gap-4 flex-wrap">
            <NavLink to="/" className={navClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/vendors" className={navClass}>
              Vendors
            </NavLink>
            <NavLink to="/products" className={navClass}>
              Products
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-gray-100 min-h-screen p-4 sm:p-6 md:p-8 w-full max-w-full mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </main>
    </Router>
  );
}
