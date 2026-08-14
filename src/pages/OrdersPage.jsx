import React, { useEffect, useState } from 'react';
import { FaTrash, FaSpinner } from 'react-icons/fa';

// Reliable SVG data URI fallback for missing product images
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%2394a3b8'%3ENo Img%3C/text%3E%3C/svg%3E";

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

  // Helper to determine product type and style badge color
  const getProductTypeInfo = (product) => {
    if (!product || typeof product !== 'object') return { label: 'Product', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    
    if (product.lugWidth || product.materialType || product.strapType) {
      return { label: 'Watch Strap', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    }
    if (product.discountPercentage || product.salePrice) {
      return { label: 'Sale Item', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    }
    return { label: 'Watch', color: 'bg-blue-100 text-blue-700 border-blue-200' };
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Customer Orders</h2>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          Total Orders: <strong className="text-slate-800">{orders.length}</strong>
        </span>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <FaSpinner className="animate-spin text-blue-600 text-xl" />
            <p className="text-slate-500 text-xs">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-slate-500 text-center py-12 text-sm">No orders found.</p>
        ) : (
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Ordered Products Detail</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Update Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-slate-50/80 transition-colors align-top">
                  <td className="p-4 font-mono text-xs text-slate-500 pt-5">
                    {order.orderId || `#${order._id.slice(-6).toUpperCase()}`}
                  </td>
                  <td className="p-4 font-medium text-slate-800 pt-5">
                    {order.shippingAddress?.fullName || 'N/A'}
                  </td>
                  <td className="p-4 text-slate-600 text-xs pt-5">
                    <div>{order.shippingAddress?.email || order.user?.email || 'N/A'}</div>
                    <div className="text-slate-400">{order.shippingAddress?.phone || 'N/A'}</div>
                  </td>
                  
                  {/* Detailed Products Column */}
                  <td className="p-4 min-w-[320px]">
                    {order.orderItems && order.orderItems.length > 0 ? (
                      <div className="space-y-3">
                        {order.orderItems.map((item, index) => {
                          const product = item.watch || item.product || {};
                          const typeInfo = getProductTypeInfo(product);
                          
                          // Comprehensive Cloudinary & Schema Image Extraction:
                          const rawImg = product?.images?.[0] || product?.image || item?.image;
                          let productImage = FALLBACK_IMAGE;

                          if (typeof rawImg === 'string' && rawImg.trim() !== '') {
                            productImage = rawImg;
                          } else if (typeof rawImg === 'object' && rawImg !== null) {
                            productImage = rawImg.url || rawImg.secure_url || rawImg.path || FALLBACK_IMAGE;
                          }

                          // Comprehensive Title/Name Fallbacks
                          const productName = product?.name || product?.title || product?.productName || item?.name || 'Product Item';
                          const productBrand = product?.brand ? `Brand: ${product.brand}` : '';

                          return (
                            <div key={index} className="flex items-start space-x-3 bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                              {/* Product Thumbnail */}
                              <img 
                                src={productImage} 
                                alt={productName} 
                                className="w-12 h-12 object-cover rounded-md border border-slate-200 bg-white flex-shrink-0"
                                onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                              />
                              
                              {/* Product Details */}
                              <div className="flex-1 text-xs">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${typeInfo.color}`}>
                                    {typeInfo.label}
                                  </span>
                                  <span className="font-semibold text-slate-900">
                                    PKR {Number(item.price || product?.price || 0).toLocaleString()}
                                  </span>
                                </div>
                                <h4 className="font-medium text-slate-800 leading-tight mb-0.5">
                                  {productName}
                                </h4>
                                {productBrand && (
                                  <p className="text-slate-500 text-[11px] mb-1">{productBrand}</p>
                                )}
                                <div className="text-slate-500 font-medium">
                                  Qty: <strong className="text-slate-700">{item.quantity || 1}</strong>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">No items specified</span>
                    )}
                  </td>

                  <td className="p-4 font-semibold text-slate-900 pt-5">
                    PKR {Number(order.totalPrice || order.grandTotal || 0).toLocaleString()}
                  </td>
                  
                  <td className="p-4 pt-5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.isPaid ? 'Paid' : 'Unpaid (COD)'}
                    </span>
                  </td>

                  <td className="p-4 pt-5">
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      {order.orderStatus || 'Pending'}
                    </span>
                  </td>

                  <td className="p-4 text-right pt-5">
                    <select
                      value={order.orderStatus || 'Pending'}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="text-xs border border-slate-300 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td className="p-4 text-center pt-5">
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