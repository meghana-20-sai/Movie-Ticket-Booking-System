import React, { useEffect, useState } from 'react';
import { Ticket, Search, Filter, Eye, CheckCircle2, XCircle, X } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getAllBookings({
        search: searchTerm,
        status: statusFilter || undefined,
        limit: 50,
      });
      if (res.success) setBookings(res.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Booking Registry</h2>
          <p className="text-xs text-slate-400">Search customer orders, references, payments, and seat allocations</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search booking ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-cinema-900 border border-slate-800 focus:border-brand-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-cinema-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none w-full sm:w-auto"
        >
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving booking transactions..." />
      ) : (
        <div className="bg-cinema-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-cinema-850 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Reference ID</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Movie & Multiplex</th>
                  <th className="py-4 px-4">Seats</th>
                  <th className="py-4 px-4">Total Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-6 font-mono font-bold text-brand-400">
                      {b.bookingReference}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{b.userId?.name || 'Customer'}</p>
                      <p className="text-[10px] text-slate-500">{b.userId?.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{b.movieId?.title || 'Movie'}</p>
                      <p className="text-[10px] text-slate-400">{b.theatreId?.name || 'Multiplex'}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {b.seats?.map((s) => `${s.row}${s.number}`).join(', ')}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">₹{b.totalAmount}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.bookingStatus === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="p-1.5 rounded-lg bg-cinema-850 hover:bg-slate-800 text-slate-300 hover:text-white"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cinema-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Reference:</span>
                <span className="font-mono text-brand-400 font-bold">{selectedBooking.bookingReference}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Movie:</span>
                <span className="text-white font-semibold">{selectedBooking.movieId?.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Cinema & Screen:</span>
                <span className="text-white">{selectedBooking.theatreId?.name} ({selectedBooking.screenId?.name})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Customer:</span>
                <span className="text-white">{selectedBooking.userId?.name} ({selectedBooking.userId?.email})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Allocated Seats:</span>
                <span className="text-brand-300 font-bold">
                  {selectedBooking.seats?.map((s) => `${s.row}${s.number}`).join(', ')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Subtotal / Total Paid:</span>
                <span className="text-white font-bold">₹{selectedBooking.subtotal} / ₹{selectedBooking.totalAmount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-bold uppercase">{selectedBooking.bookingStatus}</span>
              </div>
            </div>

            {selectedBooking.qrCode && (
              <div className="pt-2 flex flex-col items-center">
                <img
                  src={selectedBooking.qrCode}
                  alt="QR Code"
                  className="w-24 h-24 rounded-xl bg-white p-1"
                />
                <span className="text-[10px] text-slate-500 mt-1">Encrypted Access QR</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
