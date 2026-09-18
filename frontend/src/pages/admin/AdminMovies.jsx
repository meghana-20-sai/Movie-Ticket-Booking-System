import React, { useEffect, useState } from 'react';
import { Film, Plus, Search, Edit2, Trash2, Star, Clock, X, Check } from 'lucide-react';
import { movieService } from '../../services/movieService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poster: '',
    backdrop: '',
    trailerUrl: '',
    genre: 'Action, Sci-Fi',
    language: 'Telugu, Hindi, English',
    duration: 150,
    certification: 'UA',
    releaseDate: new Date().toISOString().split('T')[0],
    cast: 'Actor 1, Actor 2',
    director: '',
    status: 'now-showing',
    formats: '2D, 3D, IMAX',
  });

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await movieService.getMovies({
        search: searchTerm,
        status: statusFilter || undefined,
        limit: 100,
      });
      if (res.success) setMovies(res.data);
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMovies();
  };

  const handleOpenAddModal = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      description: '',
      poster: '',
      backdrop: '',
      trailerUrl: '',
      genre: 'Action, Sci-Fi',
      language: 'Telugu, Hindi, English',
      duration: 150,
      certification: 'UA',
      releaseDate: new Date().toISOString().split('T')[0],
      cast: 'Actor 1, Actor 2',
      director: '',
      status: 'now-showing',
      formats: '2D, 3D, IMAX',
    });
    setError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      poster: movie.poster,
      backdrop: movie.backdrop || '',
      trailerUrl: movie.trailerUrl || '',
      genre: movie.genre?.join(', ') || '',
      language: movie.language?.join(', ') || '',
      duration: movie.duration,
      certification: movie.certification,
      releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
      cast: movie.cast?.join(', ') || '',
      director: movie.director || '',
      status: movie.status,
      formats: movie.formats?.join(', ') || '2D, 3D',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...formData,
      genre: formData.genre.split(',').map((g) => g.trim()),
      language: formData.language.split(',').map((l) => l.trim()),
      cast: formData.cast.split(',').map((c) => c.trim()),
      formats: formData.formats.split(',').map((f) => f.trim()),
      duration: Number(formData.duration),
    };

    try {
      if (editingMovie) {
        const res = await movieService.updateMovie(editingMovie._id, payload);
        if (res.success) {
          setModalOpen(false);
          await fetchMovies();
        }
      } else {
        const res = await movieService.createMovie(payload);
        if (res.success) {
          setModalOpen(false);
          await fetchMovies();
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await movieService.deleteMovie(id);
      if (res.success) {
        await fetchMovies();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete movie');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Movie Management</h2>
          <p className="text-xs text-slate-400">Add, edit, or configure cinema movie releases</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Movie
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-cinema-900 border border-slate-800 focus:border-brand-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-cinema-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="">All Statuses</option>
            <option value="now-showing">Now Showing</option>
            <option value="coming-soon">Coming Soon</option>
            <option value="ended">Ended</option>
          </select>
        </div>
      </div>

      {/* Movies Table */}
      {loading ? (
        <LoadingSpinner text="Fetching movie database..." />
      ) : (
        <div className="bg-cinema-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-cinema-850 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Movie</th>
                  <th className="py-4 px-4">Genres & Lang</th>
                  <th className="py-4 px-4">Duration & Rating</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {movies.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-10 h-14 rounded-lg object-cover bg-slate-800"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{m.title}</p>
                          <p className="text-[10px] text-slate-500">Dir: {m.director || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{m.genre?.slice(0, 2).join(', ')}</p>
                      <p className="text-[10px] text-slate-400">{m.language?.join(', ')}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{m.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 font-bold text-[11px] mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{m.rating}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          m.status === 'now-showing'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : m.status === 'coming-soon'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {m.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(m)}
                          className="p-1.5 rounded-lg bg-cinema-850 hover:bg-slate-800 text-slate-300 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m._id, m.title)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                          title="Delete"
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

      {/* Add / Edit Movie Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cinema-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingMovie ? 'Edit Movie Premiere' : 'Add New Movie Premiere'}
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Movie Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  >
                    <option value="now-showing">Now Showing</option>
                    <option value="coming-soon">Coming Soon</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Plot</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Poster Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.poster}
                    onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Backdrop Image URL</label>
                  <input
                    type="url"
                    value={formData.backdrop}
                    onChange={(e) => setFormData({ ...formData, backdrop: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Certification</label>
                  <select
                    value={formData.certification}
                    onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  >
                    <option value="U">U</option>
                    <option value="UA">UA</option>
                    <option value="A">A</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Release Date</label>
                  <input
                    type="date"
                    required
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Genres (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Languages (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cast Members</label>
                  <input
                    type="text"
                    value={formData.cast}
                    onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Director</label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">YouTube Trailer URL</label>
                <input
                  type="url"
                  value={formData.trailerUrl}
                  onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
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
                  {saving ? 'Saving...' : editingMovie ? 'Save Changes' : 'Create Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMovies;
