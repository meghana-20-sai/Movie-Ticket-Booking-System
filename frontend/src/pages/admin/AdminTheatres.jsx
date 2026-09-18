import React, { useEffect, useState } from 'react';
import { Building2, Plus, Edit2, Trash2, MapPin, Phone, Mail, X } from 'lucide-react';
import { movieService } from '../../services/movieService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminTheatres = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: 'Hyderabad',
    amenities: 'Dolby Atmos, Recliner Seats, Food Court, Parking',
    phone: '',
    email: '',
  });

  const fetchTheatres = async () => {
    try {
      setLoading(true);
      const res = await movieService.getTheatres({ activeOnly: 'false' });
      if (res.success) setTheatres(res.data);
    } catch (err) {
      console.error('Failed to load theatres:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const handleOpenAdd = () => {
    setEditingTheatre(null);
    setFormData({
      name: '',
      address: '',
      city: 'Hyderabad',
      amenities: 'Dolby Atmos, Recliner Seats, Food Court, Parking',
      phone: '',
      email: '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (theatre) => {
    setEditingTheatre(theatre);
    setFormData({
      name: theatre.name,
      address: theatre.address,
      city: theatre.city,
      amenities: theatre.amenities?.join(', ') || '',
      phone: theatre.contactInfo?.phone || '',
      email: theatre.contactInfo?.email || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      amenities: formData.amenities.split(',').map((a) => a.trim()),
      contactInfo: { phone: formData.phone, email: formData.email },
    };

    try {
      if (editingTheatre) {
        const res = await movieService.updateTheatre(editingTheatre._id, payload);
        if (res.success) {
          setModalOpen(false);
          await fetchTheatres();
        }
      } else {
        const res = await movieService.createTheatre(payload);
        if (res.success) {
          setModalOpen(false);
          await fetchTheatres();
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete theatre "${name}" and all its screens?`))
      return;
    try {
      const res = await movieService.deleteTheatre(id);
      if (res.success) await fetchTheatres();
    } catch (err) {
      alert(err.message || 'Failed to delete theatre');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Multiplex Theatres</h2>
          <p className="text-xs text-slate-400">Configure cinema locations, cities, and amenities</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Multiplex
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching cinema complexes..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {theatres.map((t) => (
            <div
              key={t._id}
              className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{t.name}</h3>
                      <p className="text-xs text-brand-400 font-semibold">{t.city}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{t.address}</span>
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1">
                  {t.amenities?.map((a) => (
                    <span key={a} className="px-2 py-0.5 rounded-md bg-cinema-850 text-[10px] text-slate-300">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">{t.screenCount || 0} Screens Configured</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 rounded-lg bg-cinema-850 hover:bg-slate-800 text-slate-300"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t._id, t.name)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cinema-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingTheatre ? 'Edit Multiplex' : 'Add New Multiplex Theatre'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <p className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Theatre Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. SmartCine AMB Cinemas"
                  className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Contact</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Address</label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Amenities (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-cinema-850 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold shadow-lg shadow-brand-600/30"
                >
                  {saving ? 'Saving...' : editingTheatre ? 'Save Changes' : 'Create Theatre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTheatres;
