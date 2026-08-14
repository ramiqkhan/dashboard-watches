import React, { useEffect, useState } from 'react';

// Set up your base URL here or use an environment variable
const API_URL = 'https://backen-watches.vercel.app';

const BRANDS = [
  'Just Cavalli', 'Tory Burch', 'Tag Heuer', 'Versace', 'Movado', 
  'Tissot', 'Salvatore Ferragamo', 'Gucci', 'Maurice Lacroix', 'Burberry', 
  'Emporio Armani', 'Guess', 'Hugo Boss', 'Michael Kors', 'Tommy Hilfiger', 
  'Fossil', 'Armani Exchange', 'Daniel Wellington'
];

export default function WatchesPage() {
  const [watches, setWatches] = useState([]);
  const [editingWatch, setEditingWatch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    referenceNo: '',
    brand: BRANDS[0],
    gender: 'Men',
    category: 'Sport',
    isBestSeller: false,
    price: '',
    stock: 1,
    description: '',
    warranty: '',
    // Technical Specifications
    dialFinish: '',
    movement: '',
    caseMaterial: '',
    caseDiameter: '',
    caseThickness: '',
    strapMaterial: '',
    waterResistance: ''
  });
  const [newImages, setNewImages] = useState([]);

  // Fetch all watches
  const fetchWatches = async () => {
    try {
      const res = await fetch(`${API_URL}/api/watches`);
      const data = await res.json();
      if (data.success) setWatches(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWatches();
  }, []);

  // Handle Delete Watch
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this watch?')) {
      try {
        const response = await fetch(`${API_URL}/api/watches/${id}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          setWatches(watches.filter(w => w._id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Open Edit Modal and prefill data (including nested specifications)
  const handleEditClick = (watch) => {
    setEditingWatch(watch);
    setFormData({
      name: watch.name || '',
      referenceNo: watch.referenceNo || '',
      brand: watch.brand || BRANDS[0],
      gender: watch.gender || 'Men',
      category: watch.category || 'Sport',
      isBestSeller: watch.isBestSeller || false,
      price: watch.price || '',
      stock: watch.stock || 1,
      description: watch.description || '',
      warranty: watch.warranty || '',
      dialFinish: watch.specifications?.dialFinish || '',
      movement: watch.specifications?.movement || '',
      caseMaterial: watch.specifications?.caseMaterial || '',
      caseDiameter: watch.specifications?.caseDiameter || '',
      caseThickness: watch.specifications?.caseThickness || '',
      strapMaterial: watch.specifications?.strapMaterial || '',
      waterResistance: watch.specifications?.waterResistance || ''
    });
    setNewImages([]);
  };

  // Handle Form Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  // Submit Updated Watch
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Append core fields (excluding technical specifications which we package separately)
    Object.keys(formData).forEach(key => {
      if (!['dialFinish', 'movement', 'caseMaterial', 'caseDiameter', 'caseThickness', 'strapMaterial', 'waterResistance'].includes(key)) {
        data.append(key, formData[key]);
      }
    });

    // Package technical specs back into a nested JSON string
    const specifications = {
      dialFinish: formData.dialFinish,
      movement: formData.movement,
      caseMaterial: formData.caseMaterial,
      caseDiameter: formData.caseDiameter,
      caseThickness: formData.caseThickness,
      strapMaterial: formData.strapMaterial,
      waterResistance: formData.waterResistance
    };
    data.append('specifications', JSON.stringify(specifications));

    // Append any new image files
    for (let i = 0; i < newImages.length; i++) {
      data.append('images', newImages[i]);
    }

    try {
      const response = await fetch(`${API_URL}/api/watches/${editingWatch._id}`, {
        method: 'PUT',
        body: data,
      });
      const result = await response.json();

      if (result.success) {
        alert('Watch updated successfully!');
        setEditingWatch(null);
        fetchWatches();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('Error updating watch: ' + err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Watch Inventory</h2>
      
      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="p-4">Watch</th>
              <th className="p-4">Ref No</th>
              <th className="p-4">Brand</th>
              <th className="p-4">Category</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {watches.map(watch => (
              <tr key={watch._id} className="hover:bg-slate-50">
                <td className="p-4 flex items-center gap-3">
                  <img src={watch.images?.[0]?.url || 'https://via.placeholder.com/50'} alt="" className="w-10 h-10 object-cover rounded-md border" />
                  <span className="font-medium text-slate-800">{watch.name}</span>
                </td>
                <td className="p-4 text-slate-600 font-mono text-xs">{watch.referenceNo}</td>
                <td className="p-4 text-slate-600">{watch.brand}</td>
                <td className="p-4"><span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">{watch.category}</span></td>
                <td className="p-4 text-slate-600">{watch.stock}</td>
                <td className="p-4 font-semibold text-slate-950">Rs {watch.price}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEditClick(watch)} className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 px-3 py-1.5 rounded-md transition">Edit</button>
                  <button onClick={() => handleDelete(watch._id)} className="text-red-600 hover:text-red-800 font-medium text-xs bg-red-50 px-3 py-1.5 rounded-md transition">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Watch Modal */}
      {editingWatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full p-8 rounded-xl shadow-lg border border-slate-200 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Edit Watch Details</h3>
              <button onClick={() => setEditingWatch(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Watch Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference No</label>
                  <input type="text" name="referenceNo" value={formData.referenceNo} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                  <select name="brand" value={formData.brand} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* Categorization & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="Sport">Sport</option>
                    <option value="Classic">Classic</option>
                    <option value="High Horology">High Horology</option>
                    <option value="Vintage">Vintage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (Rs)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm font-medium text-slate-700">Best Seller</span>
                  </label>
                </div>
              </div>

              {/* Technical Specifications Section */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-md font-semibold text-slate-800 mb-3">Technical Specifications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Dial Finish</label>
                    <input type="text" name="dialFinish" value={formData.dialFinish} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Movement</label>
                    <input type="text" name="movement" value={formData.movement} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Case Material</label>
                    <input type="text" name="caseMaterial" value={formData.caseMaterial} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Case Diameter</label>
                    <input type="text" name="caseDiameter" value={formData.caseDiameter} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Case Thickness</label>
                    <input type="text" name="caseThickness" value={formData.caseThickness} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Strap Material</label>
                    <input type="text" name="strapMaterial" value={formData.strapMaterial} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Water Resistance</label>
                    <input type="text" name="waterResistance" value={formData.waterResistance} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>

              {/* Warranty and Description */}
              <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Warranty Details</label>
                  <input type="text" name="warranty" value={formData.warranty} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea name="description" rows="2" value={formData.description} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm resize-none"></textarea>
                </div>
              </div>

              {/* New Image Upload */}
              <div className="border-t border-slate-200 pt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Add More Images (Optional)</label>
                <input type="file" multiple onChange={(e) => setNewImages(e.target.files)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setEditingWatch(null)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}