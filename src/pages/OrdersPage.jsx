import React, { useEffect, useState } from 'react';
import { FaTrash, FaSpinner } from 'react-icons/fa';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle Order Status Update
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setOrders(orders.map(order => order._id === orderId ? { ...order, orderStatus: newStatus } : order));
      } else {
        alert('Failed to update status: ' + data.message);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Handle Order Deletion
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    setDeletingId(orderId);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setOrders(orders.filter(order => order._id !== orderId));
      } else {
        alert('Failed to delete order: ' + data.message);
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('An error occurred while deleting the order.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Customer Orders</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
        {loading ? (
          <p className="text-slate-500 text-center py-8">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No orders found.</p>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Products Ordered</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Update Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-xs text-slate-500">{order.orderId}</td>
                  <td className="p-4 font-medium text-slate-800">{order.shippingAddress?.fullName || 'N/A'}</td>
                  <td className="p-4 text-slate-600 text-xs">
                    <div>{order.shippingAddress?.email || order.user?.email || 'N/A'}</div>
                    <div className="text-slate-400">{order.shippingAddress?.phone || 'N/A'}</div>
                  </td>
                  
                  {/* Products Column */}
                  <td className="p-4 max-w-xs">
                    {order.orderItems && order.orderItems.length > 0 ? (
                      <div className="space-y-1">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="text-xs">
                            <span className="font-medium text-slate-800">{item.name || item.watch?.name || 'Luxury Watch'}</span>
                            <span className="text-slate-500 block">Qty: {item.quantity || 1} | PKR {item.price?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No items specified</span>
                    )}
                  </td>

                  <td className="p-4 font-semibold text-slate-900">PKR {order.totalPrice?.toLocaleString()}</td>
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
                  <td className="p-4 text-right">
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="text-xs border border-slate-300 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      disabled={deletingId === order._id}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete Order"
                    >
                      {deletingId === order._id ? (
                        <FaSpinner className="animate-spin text-sm" />
                      ) : (
                        <FaTrash className="text-sm" />
                      )}
                    </button>
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