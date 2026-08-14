import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';

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
  const [images, setImages] = useState([]); // New files selected
  const [imagePreviews, setImagePreviews] = useState([]); // Object URLs for local previews
  const [existingImages, setExistingImages] = useState([]); // Cloudinary images for edits

  const stylesList = ['Leather Strap', 'Stainless Steel', 'Mesh Strap', 'Rubber Strap'];

  // Safe API URL resolution for Vite / CRA
  const getApiUrl = () => {
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
      }
    } catch (e) {}
    
    try {
      if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
      }
    } catch (e) {}

    return 'http://localhost:5000';
  };

  // Fetch all straps using fetch
  const fetchStraps = async () => {
    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/watch-straps`);
      const data = await response.json();
      
      if (data.success) {
        setStraps(data.data);
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

  // Handle file selection, revoke old memory URLs, and generate local preview URLs
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);

    // Revoke previous URLs to avoid memory leaks
    imagePreviews.forEach(url => URL.revokeObjectURL(url));

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Open Modal for Add
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ name: '', description: '', price: '', strapType: 'Leather Strap', stock: 10 });
    setImages([]);
    setImagePreviews([]);
    setExistingImages([]);
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
    setImages([]);
    setImagePreviews([]);
    setExistingImages(strap.images || []); // Load current Cloudinary images
    setIsModalOpen(true);
  };

  // Submit Form (Create or Update) using fetch
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
      const API_URL = getApiUrl();
      const url = isEditing 
        ? `${API_URL}/api/watch-straps/${currentId}` 
        : `${API_URL}/api/watch-straps`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: data,
      });

      const result = await response.json();
      
      if (response.ok) {
        setIsModalOpen(false);
        fetchStraps();
      } else {
        console.error('Server error:', result);
      }
    } catch (err) {
      console.error('Error saving watch strap:', err);
    }
  };

  // Delete Strap using fetch
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this watch strap?')) {
      try {
        const API_URL = getApiUrl();
        const response = await fetch(`${API_URL}/api/watch-straps/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchStraps();
        }
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
                <th className="p-4">Image</th>
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
                  <td className="p-4">
                    {strap.images && strap.images.length > 0 ? (
                      <img 
                        src={strap.images[0].url} 
                        alt={strap.name} 
                        className="w-10 h-10 object-cover rounded-md border border-slate-200"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-slate-400">
                        <ImageIcon size={18} />
                      </div>
                    )}
                  </td>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 relative my-8">
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
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Images (Up to 5)</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleImageChange} 
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800" 
                />

                {/* Existing Images Previews (When Editing) */}
                {isEditing && existingImages.length > 0 && imagePreviews.length === 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-2 font-medium">Current Images:</p>
                    <div className="flex gap-2 flex-wrap">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                          <img src={img.url} alt="Uploaded preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Local Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-2 font-medium">New Image Selection Previews:</p>
                    <div className="flex gap-2 flex-wrap">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative w-16 h-16 border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                          <img src={src} alt="New upload preview" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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