import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, X } from 'lucide-react';

function WatchStrapAdmin() {
  const [straps, setStraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    strapType: 'Leather Strap',
    stock: 10
  });
  const [images, setImages] = useState([]);

  const stylesList = ['Leather Strap', 'Stainless Steel', 'Mesh Strap', 'Rubber Strap'];

  // Fetch all straps
  const fetchStraps = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/watch-straps');
      if (res.data.success) {
        setStraps(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching straps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStraps();
  }, []);

  // Handle Form Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open Modal for Add
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ name: '', description: '', price: '', strapType: 'Leather Strap', stock: 10 });
    setImages([]);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (strap) => {
    setIsEditing(true);
    setCurrentId(strap._id);
    setFormData({
      name: strap.name,
      description: strap.description,
      price: strap.price,
      strapType: strap.strapType,
      stock: strap.stock || 10
    });
    setIsModalOpen(true);
  };

  // Submit Form (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('strapType', formData.strapType);
    data.append('stock', formData.stock);

    for (let i = 0; i < images.length; i++) {
      data.append('images', images[i]);
    }

    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/watch-straps/${currentId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('http://localhost:5000/api/watch-straps', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setIsModalOpen(false);
      fetchStraps();
    } catch (err) {
      console.error('Error saving watch strap:', err);
    }
  };

  // Delete Strap
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this watch strap?')) {
      try {
        await axios.delete(`http://localhost:5000/api/watch-straps/${id}`);
        fetchStraps();
      } catch (err) {
        console.error('Error deleting strap:', err);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Watch Straps</h2>
          <p className="text-sm text-slate-500">Add, edit, or remove catalog items</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition"
        >
          <Plus size={18} /> Add New Strap
        </button>
      </div>

      {/* Table view */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading products...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {straps.map((strap) => (
                <tr key={strap._id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{strap.name}</td>
                  <td className="p-4 text-slate-600">{strap.strapType}</td>
                  <td className="p-4 font-semibold text-slate-900">${strap.price.toFixed(2)}</td>
                  <td className="p-4 text-slate-600">{strap.stock}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(strap)} className="text-blue-600 hover:text-blue-800 p-1">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(strap._id)} className="text-red-600 hover:text-red-800 p-1">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">{isEditing ? 'Edit Watch Strap' : 'Add New Watch Strap'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Strap Style Category</label>
                <select name="strapType" value={formData.strapType} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2 text-sm">
                  {stylesList.map((style) => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Price ($)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Stock</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleChange} required className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" required className="w-full border border-slate-300 rounded-lg p-2 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Images</label>
                <input type="file" multiple onChange={(e) => setImages(e.target.files)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800" />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">{isEditing ? 'Save Changes' : 'Create Strap'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default WatchStrapAdmin;