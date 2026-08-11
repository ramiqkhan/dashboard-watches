import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BRANDS = [
  'Just Cavalli', 'Tory Burch', 'Tag Heuer', 'Versace', 'Movado', 
  'Tissot', 'Salvatore Ferragamo', 'Gucci', 'Maurice Lacroix', 'Burberry', 
  'Emporio Armani', 'Guess', 'Hugo Boss', 'Michael Kors', 'Tommy Hilfiger', 
  'Fossil', 'Armani Exchange', 'Daniel Wellington'
];

export default function AddWatchPage() {
  const navigate = useNavigate();
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
    // Technical Specifications object
    dialFinish: '',
    movement: '',
    caseMaterial: '',
    caseDiameter: '',
    caseThickness: '',
    strapMaterial: '',
    waterResistance: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    
    // Append core fields
    Object.keys(formData).forEach(key => {
      // Exclude spec fields from top-level loop; we'll nest them together
      if (!['dialFinish', 'movement', 'caseMaterial', 'caseDiameter', 'caseThickness', 'strapMaterial', 'waterResistance'].includes(key)) {
        data.append(key, formData[key]);
      }
    });

    // Package technical specs into a nested JSON string for the backend service
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

    // Append image files
    for (let i = 0; i < images.length; i++) {
      data.append('images', images[i]);
    }

    try {
      const response = await fetch('http://localhost:5000/api/watches', {
        method: 'POST',
        body: data,
      });
      const result = await response.json();
      
      if (result.success) {
        alert('Watch added successfully!');
        navigate('/watches');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('Error adding watch: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl bg-white p-8 rounded-xl shadow-sm border border-slate-200 mx-auto my-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Add New Watch</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Watch Name *</label>
            <input type="text" name="name" onChange={handleChange} required placeholder="e.g. Daniel Wellington Classic" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reference No *</label>
            <input type="text" name="referenceNo" onChange={handleChange} required placeholder="e.g. DW-0204DW" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand *</label>
            <select name="brand" onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
              {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        {/* Categorization & Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
            <select name="gender" onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
            <select name="category" onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm bg-white">
              <option value="Sport">Sport</option>
              <option value="Classic">Classic</option>
              <option value="High Horology">High Horology</option>
              <option value="Vintage">Vintage</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price (Rs) *</label>
            <input type="number" name="price" onChange={handleChange} required placeholder="14000" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Stock Qty *</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isBestSeller" onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm font-medium text-slate-700">Best Seller</span>
            </label>
          </div>
        </div>

        {/* Technical Specifications Section */}
        <div className="border-t border-slate-200 pt-4">
          <h3 className="text-md font-semibold text-slate-800 mb-3">Technical Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dial Finish</label>
              <input type="text" name="dialFinish" onChange={handleChange} required placeholder="Eggshell White" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Movement</label>
              <input type="text" name="movement" onChange={handleChange} required placeholder="Japanese Quartz" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Case Material</label>
              <input type="text" name="caseMaterial" onChange={handleChange} required placeholder="316L Stainless Steel" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Case Diameter</label>
              <input type="text" name="caseDiameter" onChange={handleChange} required placeholder="40mm" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Case Thickness</label>
              <input type="text" name="caseThickness" onChange={handleChange} required placeholder="6mm Ultra-Slim" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Strap Material</label>
              <input type="text" name="strapMaterial" onChange={handleChange} required placeholder="Italian Calfskin Leather" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Water Resistance</label>
              <input type="text" name="waterResistance" onChange={handleChange} required placeholder="3 ATM (30 Meters)" className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Descriptions & Warranty */}
        <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Warranty Details *</label>
            <input type="text" name="warranty" onChange={handleChange} required placeholder="2-Year Official Manufacturer Guarantee" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea name="description" rows="2" onChange={handleChange} required placeholder="Embodying pure minimalist elegance..." className="w-full border rounded-lg px-3 py-2 text-sm resize-none"></textarea>
          </div>
        </div>

        {/* Images */}
        <div className="border-t border-slate-200 pt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Watch Images (Cloudinary Upload)</label>
          <input type="file" multiple onChange={(e) => setImages(e.target.files)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100" />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium text-sm hover:bg-slate-800 transition disabled:opacity-50"
        >
          {loading ? "Saving Watch to Database..." : "Save Watch"}
        </button>
      </form>
    </div>
  );
}