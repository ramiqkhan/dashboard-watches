import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Watch, ShoppingBag, Mail, Tag, PlusCircle, Layers } from 'lucide-react';

// Components placeholders & pages
import WatchesPage from './pages/WatchesPage';
import AddWatchPage from './pages/AddWatchPage';
import WatchStrapAdmin from './pages/WatchStrapPage'; // <-- Import the new admin component
import OrdersPage from './pages/OrdersPage';
import ContactsPage from './pages/ContactsPage';
import SalesPage from './pages/SalesPage';
import DashboardHome from './pages/DashboardHome';

function App() {
  return (
    <Router>
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
            <span className="text-sm font-medium text-slate-500">Admin Panel</span>
          </header>
          <div className="p-8">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/watches" element={<WatchesPage />} />
              <Route path="/watches/add" element={<AddWatchPage />} />
              <Route path="/watch-straps" element={<WatchStrapAdmin />} /> {/* <-- Route for straps management */}
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;