import React, { useEffect, useState } from 'react';
import { Tv, Plus, Edit2, Trash2, Building2, X } from 'lucide-react';
import { movieService } from '../../services/movieService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminScreens = () => {
  const [screens, setScreens] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    theatreId: '',
    name: '',
    format: '2D',
    soundSystem: 'Dolby Atmos 7.1',
    capacity: 80,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [screensRes, theatresRes] = await Promise.all([
        movieService.getScreens(),
        movieService.getTheatres(),
      ]);

      if (screensRes.success) setScreens(screensRes.data);
      if (theatresRes.success) {
        setTheatres(theatresRes.data);
        if (theatresRes.data.length > 0 && !formData.theatreId) {
          setFormData((prev) => ({ ...prev, theatreId: theatresRes.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load screens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingScreen(null);
    setFormData({
      theatreId: theatres[0]?._id || '',
      name: '',
      format: '2D',
      soundSystem: 'Dolby Atmos 7.1',
      capacity: 80,
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (screen) => {
    setEditingScreen(screen);
    setFormData({
      theatreId: screen.theatreId?._id || screen.theatreId,
      name: screen.name,
      format: screen.format,
      soundSystem: screen.soundSystem || 'Dolby Atmos 7.1',
      capacity: screen.capacity,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingScreen) {
        const res = await movieService.updateScreen(editingScreen._id, formData);
        if (res.success) {
          setModalOpen(false);
          await fetchData();
        }
      } else {
        const res = await movieService.createScreen(formData);
        if (res.success) {
          setModalOpen(false);
          await fetchData();
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete screen "${name}"?`)) return;
    try {
      const res = await movieService.deleteScreen(id);
      if (res.success) await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete screen');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Auditorium Screens</h2>
          <p className="text-xs text-slate-400">Configure multiplex screens, audio systems, and seating layouts</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Screen
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading auditorium screens..." />
      ) : (
        <div className="bg-cinema-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-cinema-850 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Screen Name</th>
                  <th className="py-4 px-4">Multiplex Theatre</th>
                  <th className="py-4 px-4">Format</th>
                  <th className="py-4 px-4">Sound System</th>
                  <th className="py-4 px-4">Capacity</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {screens.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-6 font-bold text-white flex items-center gap-2">
                      <Tv className="w-4 h-4 text-brand-500" />
                      {s.name}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {s.theatreId?.name || 'Multiplex'} ({s.theatreId?.city || ''})
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-md bg-brand-600/20 text-brand-300 border border-brand-500/30 font-bold text-[10px]">
                        {s.format}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{s.soundSystem || 'Dolby 7.1'}</td>
                    <td className="py-3 px-4 font-bold text-white">{s.capacity} seats</td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg bg-cinema-850 hover:bg-slate-800 text-slate-300"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s._id, s.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cinema-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingScreen ? 'Edit Auditorium Screen' : 'Add New Auditorium Screen'}
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
                <label className="block text-slate-300 font-semibold mb-1">Select Theatre</label>
                <select
                  required
                  value={formData.theatreId}
                  onChange={(e) => setFormData({ ...formData, theatreId: e.target.value })}
                  className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                >
                  {theatres.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Screen Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Screen 1 (IMAX Laser)"
                  className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Format</label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="4DX">4DX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Capacity</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Sound Architecture</label>
                <input
                  type="text"
                  value={formData.soundSystem}
                  onChange={(e) => setFormData({ ...formData, soundSystem: e.target.value })}
                  placeholder="e.g. Dolby Atmos 7.1"
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
                  {saving ? 'Saving...' : editingScreen ? 'Save Changes' : 'Create Screen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminScreens;
