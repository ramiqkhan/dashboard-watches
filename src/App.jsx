import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Watch, ShoppingBag, Mail, Tag, PlusCircle, Layers, LogOut, Lock, User } from 'lucide-react';

// Pages
import WatchesPage from './pages/WatchesPage';
import AddWatchPage from './pages/AddWatchPage';
import WatchStrapAdmin from './pages/WatchStrapPage';
import OrdersPage from './pages/OrdersPage';
import ContactsPage from './pages/ContactsPage';
import SalesPage from './pages/SalesPage';
import DashboardHome from './pages/DashboardHome';

// --- LOGIN PAGE COMPONENT ---
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Replace these credentials with your backend API authentication request
    if (username === 'admin' && password === 'admin123') {
      onLogin();
      navigate('/');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">WatchAdmin</h2>
          <p className="mt-2 text-sm text-slate-500">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium border border-red-200">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition text-slate-800 text-sm"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition text-slate-800 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-md transition duration-200"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('isAdminAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
          } 
        />

        {/* Protected Admin Panel */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex h-screen bg-gray-100 font-sans">
                {/* Sidebar */}
                <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
                  <div className="p-6 text-2xl font-bold text-white tracking-wider border-b border-slate-800">
                    WatchAdmin
                  </div>
                  <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition">
                      <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link to="/watches" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition">
                      <Watch size={20} /> Watches
                    </Link>
                    <Link to="/watches/add" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition">
                      <PlusCircle size={20} /> Add Watch
                    </Link>
                    <Link to="/watch-straps" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition">
                      <Layers size={20} /> Watch Straps
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition">
                      <ShoppingBag size={20} /> Orders
                    </Link>
                    <Link to="/sales" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition">
                      <Tag size={20} /> Sales & Promos
                    </Link>
                    <Link to="/contacts" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition">
                      <Mail size={20} /> Contacts
                    </Link>
                  </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto">
                  <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-slate-800">Store Management Dashboard</h1>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-500">Admin Panel</span>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </header>
                  
                  <div className="p-8">
                    <Routes>
                      <Route path="/" element={<DashboardHome />} />
                      <Route path="/watches" element={<WatchesPage />} />
                      <Route path="/watches/add" element={<AddWatchPage />} />
                      <Route path="/watch-straps" element={<WatchStrapAdmin />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/sales" element={<SalesPage />} />
                      <Route path="/contacts" element={<ContactsPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </div>
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;