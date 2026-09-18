import React, { useEffect, useState } from 'react';
import { Armchair, Save, Plus, Trash2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { movieService } from '../../services/movieService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminSeats = () => {
  const [screens, setScreens] = useState([]);
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [currentScreen, setCurrentScreen] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchScreens = async () => {
      try {
        setLoading(true);
        const res = await movieService.getScreens();
        if (res.success && res.data.length > 0) {
          setScreens(res.data);
          setSelectedScreenId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load screens:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScreens();
  }, []);

  useEffect(() => {
    if (!selectedScreenId) return;
    const fetchScreenDetails = async () => {
      try {
        const res = await movieService.getScreenById(selectedScreenId);
        if (res.success) {
          setCurrentScreen(res.data);
          setRows(res.data.seatLayout?.rows || []);
        }
      } catch (err) {
        console.error('Failed to load screen layout:', err);
      }
    };
    fetchScreenDetails();
  }, [selectedScreenId]);

  const handleAddRow = () => {
    const nextRowLabel = String.fromCharCode(65 + rows.length); // A, B, C...
    setRows([
      ...rows,
      {
        rowLabel: nextRowLabel,
        category: 'Regular',
        seatsCount: 10,
        priceMultiplier: 1.0,
      },
    ]);
  };

  const handleRemoveRow = (index) => {
    setRows(rows.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    if (field === 'category') {
      updated[index].priceMultiplier =
        value === 'Premium' ? 1.5 : value === 'Executive' ? 1.25 : 1.0;
    }
    setRows(updated);
  };

  const handleSaveLayout = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await movieService.updateScreen(selectedScreenId, {
        seatLayout: { rows },
      });
      if (res.success) {
        setMessage('Seat map layout and multipliers successfully updated and synchronized!');
      }
    } catch (err) {
      alert(err.message || 'Failed to update seat layout');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading cinema screen layout builder..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Seat Layout & Multiplier Configurator</h2>
          <p className="text-xs text-slate-400">Design row structures, tiers (Premium, Executive, Regular) and price rates</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedScreenId}
            onChange={(e) => setSelectedScreenId(e.target.value)}
            className="bg-cinema-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            {screens.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.theatreId?.name || 'Multiplex'})
              </option>
            ))}
          </select>

          <button
            onClick={handleSaveLayout}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" /> {message}
        </div>
      )}

      {/* Grid: Row Configurator on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Row Tier Table */}
        <div className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Configured Seating Tiers</h3>
            <button
              onClick={handleAddRow}
              className="flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300"
            >
              <Plus className="w-3.5 h-3.5" /> Add Row
            </button>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {rows.map((row, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-cinema-850 border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 font-black text-white text-center">{row.rowLabel}</span>
                  <select
                    value={row.category}
                    onChange={(e) => handleRowChange(idx, 'category', e.target.value)}
                    className="bg-cinema-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white outline-none"
                  >
                    <option value="Premium">Premium (1.5x)</option>
                    <option value="Executive">Executive (1.25x)</option>
                    <option value="Regular">Regular (1.0x)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Seats:</span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={row.seatsCount}
                      onChange={(e) => handleRowChange(idx, 'seatsCount', Number(e.target.value))}
                      className="w-14 bg-cinema-900 border border-slate-700 rounded-lg p-1 text-center text-xs text-white outline-none"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveRow(idx)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Remove row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Visual Representation */}
        <div className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-between">
          <div className="w-full pb-3 border-b border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-white">Live Visual Representation</span>
            <span className="text-slate-400">
              Total: <span className="text-white font-bold">{rows.reduce((acc, r) => acc + (r.seatsCount || 10), 0)} Seats</span>
            </span>
          </div>

          {/* Screen projection bar */}
          <div className="w-4/5 h-2 bg-gradient-to-r from-transparent via-brand-500 to-transparent rounded-full my-6 shadow-lg shadow-brand-500/50"></div>

          {/* Seat Rows Visual */}
          <div className="w-full overflow-x-auto flex flex-col gap-2 items-center py-4">
            {rows.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-4 text-[10px] font-bold text-slate-500">{row.rowLabel}</span>
                <div className="flex gap-1">
                  {Array.from({ length: row.seatsCount || 10 }).map((_, sIdx) => {
                    const isPremium = row.category === 'Premium';
                    const isExecutive = row.category === 'Executive';
                    return (
                      <div
                        key={sIdx}
                        className={`w-5 h-5 rounded border flex items-center justify-center text-[9px] font-semibold ${
                          isPremium
                            ? 'bg-brand-600/30 border-brand-500 text-brand-300'
                            : isExecutive
                            ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                            : 'bg-cinema-850 border-slate-700 text-slate-400'
                        }`}
                      >
                        {sIdx + 1}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="w-full pt-4 border-t border-slate-800/80 flex items-center justify-center gap-4 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-600/40 border border-brand-500"></span> Premium</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-600/40 border border-amber-500"></span> Executive</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-cinema-850 border border-slate-700"></span> Regular</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSeats;
