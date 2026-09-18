import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, Clock, MapPin, Tv, X, AlertCircle } from 'lucide-react';
import { movieService } from '../../services/movieService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminShows = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    movieId: '',
    theatreId: '',
    screenId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '21:00',
    language: 'English',
    format: '2D',
    basePrice: 250,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [showsRes, moviesRes, theatresRes, screensRes] = await Promise.all([
        movieService.getShows(),
        movieService.getMovies({ limit: 100 }),
        movieService.getTheatres(),
        movieService.getScreens(),
      ]);

      if (showsRes.success) setShows(showsRes.data);
      if (moviesRes.success) setMovies(moviesRes.data);
      if (theatresRes.success) setTheatres(theatresRes.data);
      if (screensRes.success) setScreens(screensRes.data);

      if (moviesRes.data.length > 0 && !formData.movieId) {
        setFormData((prev) => ({
          ...prev,
          movieId: moviesRes.data[0]._id,
          theatreId: theatresRes.data[0]?._id || '',
          screenId: screensRes.data[0]?._id || '',
        }));
      }
    } catch (err) {
      console.error('Failed to load shows schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      movieId: movies[0]?._id || '',
      theatreId: theatres[0]?._id || '',
      screenId: screens[0]?._id || '',
      date: new Date().toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '21:00',
      language: 'English',
      format: '2D',
      basePrice: 250,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await movieService.createShow(formData);
      if (res.success) {
        setModalOpen(false);
        await fetchData();
      }
    } catch (err) {
      setError(err.message || 'Show schedule conflict detected.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and remove this scheduled showtime?'))
      return;
    try {
      const res = await movieService.deleteShow(id);
      if (res.success) await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete show');
    }
  };

  // Filter available screens by selected theatre in modal
  const filteredScreens = screens.filter(
    (s) => (s.theatreId?._id || s.theatreId) === formData.theatreId
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Show Scheduling & Timetable</h2>
          <p className="text-xs text-slate-400">
            Schedule movies on screens with automated collision and overlap validation
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Schedule Show
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading cinema timetable schedules..." />
      ) : (
        <div className="bg-cinema-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-cinema-850 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Movie</th>
                  <th className="py-4 px-4">Multiplex & Screen</th>
                  <th className="py-4 px-4">Date & Time</th>
                  <th className="py-4 px-4">Format & Price</th>
                  <th className="py-4 px-4">Occupancy Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shows.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-6 font-bold text-white flex items-center gap-2.5">
                      <img
                        src={s.movieId?.poster}
                        alt=""
                        className="w-8 h-11 rounded object-cover bg-slate-800"
                      />
                      <span>{s.movieId?.title || 'Movie'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{s.theatreId?.name || 'Multiplex'}</p>
                      <p className="text-[10px] text-slate-400">{s.screenId?.name || 'Screen 1'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{s.date}</p>
                      <p className="text-[10px] text-slate-400">{s.startTime} - {s.endTime}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-brand-600/20 text-brand-300 font-bold text-[10px]">
                        {s.format}
                      </span>
                      <span className="text-white font-bold ml-2">₹{s.basePrice}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-200 font-semibold">{s.availabilityStatus}</span>
                      <span className="text-[10px] text-slate-400 block">{s.remainingSeats} seats left</span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={() => handleDelete(s._id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        title="Delete Show"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cinema-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Schedule Movie Showtime</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <p className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Movie</label>
                <select
                  required
                  value={formData.movieId}
                  onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                  className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.certification})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Theatre</label>
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
                  <label className="block text-slate-300 font-semibold mb-1">Screen</label>
                  <select
                    required
                    value={formData.screenId}
                    onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  >
                    {filteredScreens.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.format})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Show Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">End Time (24h)</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
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
                  <label className="block text-slate-300 font-semibold mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full bg-cinema-850 border border-slate-800 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
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
                  {saving ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShows;
