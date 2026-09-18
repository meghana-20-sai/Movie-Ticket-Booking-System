import React, { useEffect, useState } from 'react';
import { Users, Search, ShieldCheck, ShieldAlert, UserCheck, Check, X } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getAllUsers({
        search: searchTerm,
        role: roleFilter || undefined,
      });
      if (res.success) setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    try {
      const res = await bookingService.toggleUserStatus(user._id);
      if (res.success) {
        setUsers(
          users.map((u) => (u._id === user._id ? { ...u, isActive: res.data.isActive } : u))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">User Accounts & Roles</h2>
          <p className="text-xs text-slate-400">View customer activity, order counts, and toggle account activation</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-cinema-900 border border-slate-800 focus:border-brand-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        </form>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-cinema-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none w-full sm:w-auto"
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="admin">Administrator</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving registered user accounts..." />
      ) : (
        <div className="bg-cinema-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-cinema-850 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-4">Contact</th>
                  <th className="py-4 px-4">Role & City</th>
                  <th className="py-4 px-4">Bookings / Spent</th>
                  <th className="py-4 px-4">Account Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-6 font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-600/30 text-brand-300 border border-brand-500/40 flex items-center justify-center font-bold text-xs">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[10px] text-slate-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{u.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{u.preferredCity}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-white">{u.totalBookings || 0} bookings</p>
                      <p className="text-[10px] text-brand-400">₹{u.totalSpent || 0} spent</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                          u.isActive
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
