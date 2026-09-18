import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, ShieldCheck, Ticket, Check, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const Profile = () => {
  const { user, updateUser, updateCity } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferredCity: user?.preferredCity || 'Hyderabad',
    profileImage: user?.profileImage || '',
    newPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        preferredCity: formData.preferredCity,
        profileImage: formData.profileImage,
      };

      if (formData.newPassword) {
        payload.password = formData.newPassword;
      }

      const res = await authService.updateProfile(payload);
      if (res.success) {
        updateUser(res.data);
        updateCity(formData.preferredCity);
        setSuccessMessage('Profile updated successfully!');
        setFormData((prev) => ({ ...prev, newPassword: '' }));
      }
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-black text-white">My Profile</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal details, preferred cinema city, and account security
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl space-y-4">
            <div className="relative mx-auto w-24 h-24 rounded-full overflow-hidden bg-brand-600/20 border-2 border-brand-500/40 flex items-center justify-center text-brand-400 font-bold text-2xl shadow-lg">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-base text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              <span className="mt-2 inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30 capitalize">
                {user?.role} Account
              </span>
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-between">
                <span>Account Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cinema City</span>
                <span className="text-white font-semibold">{user?.preferredCity || 'Hyderabad'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="md:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5"
          >
            <h3 className="text-base font-bold text-white pb-3 border-b border-slate-800">
              Personal Information
            </h3>

            {successMessage && (
              <p className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" /> {successMessage}
              </p>
            )}

            {errorMessage && (
              <p className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                {errorMessage}
              </p>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-cinema-850 border border-slate-800 focus:border-brand-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Email (Read only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address (Permanent)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-cinema-950 border border-slate-800/60 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-500 outline-none cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full bg-cinema-850 border border-slate-800 focus:border-brand-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Preferred City */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Cinema City</label>
              <div className="relative">
                <select
                  name="preferredCity"
                  value={formData.preferredCity}
                  onChange={handleChange}
                  className="w-full bg-cinema-850 border border-slate-800 focus:border-brand-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white outline-none"
                >
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Vijayawada">Vijayawada</option>
                  <option value="Visakhapatnam">Visakhapatnam</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Chennai">Chennai</option>
                </select>
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Profile Image URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Profile Avatar URL (Optional)
              </label>
              <input
                type="url"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-cinema-850 border border-slate-800 focus:border-brand-500 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Update Password (Leave blank to keep current)
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password (min 6 characters)"
                className="w-full bg-cinema-850 border border-slate-800 focus:border-brand-500 rounded-xl py-2.5 px-3.5 text-xs text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
