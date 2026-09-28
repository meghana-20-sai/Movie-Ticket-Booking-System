import React, { useState } from 'react';
import { Plus, Minus, Popcorn, Sparkles, Check, Flame } from 'lucide-react';
import { CINEMA_SNACKS } from '../data/defaultSnacks';
import { useBooking } from '../context/BookingContext';

export default function SnackSelector() {
  const { selectedSnacks, addSnack, removeSnack } = useBooking();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Popcorn', 'Combos', 'Beverages', 'Quick Bites'];

  const filteredSnacks =
    activeCategory === 'All'
      ? CINEMA_SNACKS
      : CINEMA_SNACKS.filter((s) => s.category === activeCategory);

  const getQuantity = (snackId) => {
    const item = selectedSnacks.find((s) => s.id === snackId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Title & Popcorn Lounge Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍿</span>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Cinema Food & Popcorn Lounge
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              At-Seat Delivery
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fresh hot butter popcorn, gourmet snacks & chilled beverages delivered straight to your cinema seat
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md'
                  : 'bg-cinema-850 hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Snacks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSnacks.map((snack) => {
          const qty = getQuantity(snack.id);

          return (
            <div
              key={snack.id}
              className={`group relative rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between border ${
                qty > 0
                  ? 'bg-gradient-to-br from-rose-950/30 to-amber-950/20 border-rose-500/60 shadow-lg shadow-rose-900/20'
                  : 'bg-cinema-850/80 hover:bg-cinema-850 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Badge if available */}
              {snack.badge && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-wider shadow">
                  {snack.badge}
                </span>
              )}

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 relative">
                    <img
                      src={snack.image}
                      alt={snack.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 left-1 text-xs">
                      {snack.icon}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm border border-emerald-500 flex items-center justify-center p-[1px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </span>
                      <h3 className="text-xs sm:text-sm font-black text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                        {snack.name}
                      </h3>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                      {snack.description}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {snack.size}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Quantity Controls */}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-black text-white">
                    ₹{snack.price}
                  </span>
                  {snack.originalPrice && (
                    <span className="text-[10px] text-slate-500 line-through">
                      ₹{snack.originalPrice}
                    </span>
                  )}
                </div>

                {qty === 0 ? (
                  <button
                    onClick={() => addSnack(snack)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-gradient-to-r hover:from-rose-600 hover:to-amber-500 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700 hover:border-transparent active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-cinema-900 border border-rose-500/50 rounded-xl px-2 py-0.5">
                    <button
                      onClick={() => removeSnack(snack.id)}
                      className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black text-rose-400 min-w-[16px] text-center">
                      {qty}
                    </span>
                    <button
                      onClick={() => addSnack(snack)}
                      className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
