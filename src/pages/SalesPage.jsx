import React, { useEffect, useState } from 'react';

const BRANDS = [
  'All', 'Just Cavalli', 'Tory Burch', 'Tag Heuer', 'Versace', 'Movado', 
  'Tissot', 'Salvatore Ferragamo', 'Gucci', 'Maurice Lacroix', 'Burberry', 
  'Emporio Armani', 'Guess', 'Hugo Boss', 'Michael Kors', 'Tommy Hilfiger', 
  'Fossil', 'Armani Exchange', 'Daniel Wellington'
];

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [allWatches, setAllWatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState(null); // For viewing attached watches & cut prices
  const [editingSaleId, setEditingSaleId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercentage: '',
    applicableBrand: 'All',
    watches: [],
    startDate: '',
    endDate: '',
    isActive: true
  });

  // Fetch all sales and watches
  const fetchData = async () => {
    try {
      const [salesRes, watchesRes] = await Promise.all([
        fetch('http://localhost:5000/api/sales'),
        fetch('http://localhost:5000/api/watches')
      ]);
      const salesData = await salesRes.json();
      const watchesData = await watchesRes.json();

      if (salesData.success) setSales(salesData.data);
      if (watchesData.success) setAllWatches(watchesData.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  // Handle multi-select watch checkboxes
  const handleWatchSelection = (watchId) => {
    const currentWatches = [...formData.watches];
    if (currentWatches.includes(watchId)) {
      setFormData({ ...formData, watches: currentWatches.filter(id => id !== watchId) });
    } else {
      setFormData({ ...formData, watches: [...currentWatches, watchId] });
    }
  };

  const handleOpenCreateModal = () => {
    setEditingSaleId(null);
    setFormData({
      title: '',
      description: '',
      discountPercentage: '',
      applicableBrand: 'All',
      watches: [],
      startDate: '',
      endDate: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sale) => {
    setEditingSaleId(sale._id);
    setFormData({
      title: sale.title,
      description: sale.description,
      discountPercentage: sale.discountPercentage,
      applicableBrand: sale.applicableBrand || 'All',
      watches: sale.watches ? sale.watches.map(w => w._id || w) : [],
      startDate: sale.startDate ? sale.startDate.split('T')[0] : '',
      endDate: sale.endDate ? sale.endDate.split('T')[0] : '',
      isActive: sale.isActive
    });
    setIsModalOpen(true);
  };

  // Create or Update Sale Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingSaleId 
      ? `http://localhost:5000/api/sales/${editingSaleId}` 
      : 'http://localhost:5000/api/sales';
    const method = editingSaleId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        alert(editingSaleId ? 'Sale updated successfully!' : 'Sale created successfully!');
        setIsModalOpen(false);
        fetchData();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Error saving sale:', err);
    }
  };

  // Delete Sale
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale campaign?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/sales/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setSales(sales.filter(s => s._id !== id));
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Error deleting sale:', err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Active & Promotional Sales</h2>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-800 transition"
        >
          + Add New Sale
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <p className="text-slate-500 text-center py-8">Loading sales campaigns...</p>
        ) : sales.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No sale campaigns found.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Campaign Title</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Brand Focus</th>
                <th className="p-4">Attached Watches</th>
                <th className="p-4">Period</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {sales.map(sale => (
                <tr key={sale._id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{sale.title}</td>
                  <td className="p-4 font-bold text-emerald-600">{sale.discountPercentage}% OFF</td>
                  <td className="p-4 text-slate-600">{sale.applicableBrand}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => setViewingSale(sale)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-xs bg-indigo-50 px-3 py-1.5 rounded-md transition"
                    >
                      View Watches ({sale.watches?.length || 0})
                    </button>
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(sale.startDate).toLocaleDateString()} - {new Date(sale.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sale.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {sale.isActive ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button 
                      onClick={() => handleOpenEditModal(sale)} 
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 px-3 py-1.5 rounded-md transition"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(sale._id)} 
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

      {/* View Watches & Cloudinary Image / Cut Pricing Modal */}
      {viewingSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full p-8 rounded-xl shadow-lg border border-slate-200 my-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{viewingSale.title} - Pricing Breakdown</h3>
                <p className="text-xs text-slate-500">{viewingSale.description} ({viewingSale.discountPercentage}% Discount)</p>
              </div>
              <button onClick={() => setViewingSale(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto my-4 border rounded-lg">
              {(!viewingSale.watches || viewingSale.watches.length === 0) ? (
                <p className="text-slate-500 text-center py-8 text-sm">No specific watches attached to this sale.</p>
              ) : (
                viewingSale.watches.map((watchItem) => {
                  const watch = typeof watchItem === 'object' ? watchItem : allWatches.find(w => w._id === watchItem);
                  if (!watch) return null;

                  const originalPrice = Number(watch.price) || 0;
                  const discount = Number(viewingSale.discountPercentage) || 0;
                  const discountedPrice = (originalPrice - (originalPrice * (discount / 100))).toFixed(2);
                  const watchImage = watch.images?.[0]?.url || 'https://via.placeholder.com/50';

                  return (
                    <div key={watch._id} className="flex items-center justify-between p-3 hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <img 
                          src={watchImage} 
                          alt={watch.name} 
                          className="w-12 h-12 object-cover rounded-md border" 
                        />
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{watch.name}</p>
                          <p className="text-xs text-slate-500">{watch.brand}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 line-through mr-2">${originalPrice.toFixed(2)}</span>
                        <span className="font-bold text-emerald-600 text-sm">${discountedPrice}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setViewingSale(null)} 
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white max-w-xl w-full p-8 rounded-xl shadow-lg border border-slate-200 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingSaleId ? 'Edit Sale Campaign' : 'Create Sale Campaign'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Campaign Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  className="w-full border rounded-lg px-3 py-2 text-sm" 
                  placeholder="e.g. Summer Luxury Blowout"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  rows="2" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required 
                  className="w-full border rounded-lg px-3 py-2 text-sm" 
                  placeholder="Details regarding the promotion..."
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Discount Percentage (%)</label>
                  <input 
                    type="number" 
                    name="discountPercentage" 
                    min="0" 
                    max="100" 
                    value={formData.discountPercentage} 
                    onChange={handleChange} 
                    required 
                    className="w-full border rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Applicable Brand</label>
                  <select 
                    name="applicableBrand" 
                    value={formData.applicableBrand} 
                    onChange={handleChange} 
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {BRANDS.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Watches for Sale (Optional)</label>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {allWatches.map(watch => (
                    <label key={watch._id} className="flex items-center gap-2 text-sm p-1 hover:bg-slate-50 cursor-pointer rounded">
                      <input 
                        type="checkbox" 
                        checked={formData.watches.includes(watch._id)} 
                        onChange={() => handleWatchSelection(watch._id)} 
                        className="w-4 h-4 text-blue-600 rounded" 
                      />
                      <img 
                        src={watch.images?.[0]?.url || 'https://via.placeholder.com/30'} 
                        alt={watch.name} 
                        className="w-6 h-6 object-cover rounded border" 
                      />
                      <span className="text-slate-800 font-medium">{watch.name}</span>
                      <span className="text-slate-400 text-xs ml-auto">${watch.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={formData.startDate} 
                    onChange={handleChange} 
                    required 
                    className="w-full border rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    value={formData.endDate} 
                    onChange={handleChange} 
                    required 
                    className="w-full border rounded-lg px-3 py-2 text-sm" 
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="isActive" 
                    checked={formData.isActive} 
                    onChange={handleChange} 
                    className="w-4 h-4 text-blue-600 rounded" 
                  />
                  <span className="text-sm font-medium text-slate-700">Is Active Campaign</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
                >
                  {editingSaleId ? 'Save Changes' : 'Create Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}