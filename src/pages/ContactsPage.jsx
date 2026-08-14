const API_BASE_URL = 'https://backen-watches.vercel.app';

import React, { useEffect, useState } from 'react';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all contact messages
  const fetchContacts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/contacts`); 
      const data = await res.json();
      
      // Check both standard formats (data.data or direct array)
      if (data.success) {
        setContacts(data.data || data.contacts || data);
      } else if (Array.isArray(data)) {
        setContacts(data);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchContacts();
  }, []);

  // Handle Delete Message
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setContacts(contacts.filter(c => c._id !== id));
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  // Handle Status Toggle
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contacts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        setContacts(contacts.map(c => c._id === id ? { ...c, status: newStatus } : c));
      } else {
        alert('Error updating status: ' + data.message);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Customer Support Messages</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="text-slate-500 text-center py-8">Loading messages...</p>
        ) : contacts.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No support messages found.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Sender</th>
                <th className="p-4">Email</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Message</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {contacts.map(c => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{c.name}</td>
                  <td className="p-4 text-slate-600">{c.email}</td>
                  <td className="p-4 font-semibold text-slate-900">{c.subject}</td>
                  <td className="p-4 text-slate-600 truncate max-w-xs">{c.message}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {c.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <select
                      value={c.status || 'Pending'}
                      onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      className="text-xs border border-slate-300 rounded-md px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Read">Read</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    <button 
                      onClick={() => handleDelete(c._id)} 
                      className="text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 px-3 py-1.5 rounded-md transition"
                    >
                      Delete
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