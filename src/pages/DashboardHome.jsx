import React, { useEffect, useState } from 'react';
import { ShoppingBag, Watch, Mail, Tag, TrendingUp, DollarSign } from 'lucide-react';

function DashboardHome() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeWatches: 0,
    supportMessages: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, watchesRes, contactsRes] = await Promise.all([
          fetch('http://localhost:5000/api/orders'),
          fetch('http://localhost:5000/api/watches'),
          fetch('http://localhost:5000/api/contact')
        ]);

        const ordersData = await ordersRes.json();
        const watchesData = await watchesRes.json();
        const contactsData = await contactsRes.json();

        let revenue = 0;
        let ordersList = [];

        if (ordersData.success) {
          ordersList = ordersData.data;
          revenue = ordersList.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
        }

        const activeWatchesCount = watchesData.success ? watchesData.data.length : 0;
        const messagesCount = contactsData.success ? contactsData.data.length : 0;

        setStats({
          totalRevenue: revenue,
          totalOrders: ordersList.length,
          activeWatches: activeWatchesCount,
          supportMessages: messagesCount,
        });

        setRecentOrders(ordersList.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Store Overview</h2>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalOrders}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Watches</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.activeWatches}</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Watch size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Support Messages</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.supportMessages}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Mail size={24} />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Recent Orders</h3>
          <span className="text-xs text-slate-500 font-medium">Showing latest store transactions</span>
        </div>

        {loading ? (
          <p className="text-slate-500 text-center py-8">Loading dashboard metrics...</p>
        ) : recentOrders.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No recent orders found.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {recentOrders.map(order => (
                <tr key={order._id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-xs text-slate-500">{order._id}</td>
                  <td className="p-4 font-medium text-slate-800">{order.shippingAddress?.fullName || 'N/A'}</td>
                  <td className="p-4 font-semibold text-slate-900">${order.totalPrice?.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DashboardHome;