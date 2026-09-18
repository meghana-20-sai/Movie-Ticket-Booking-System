import React from 'react';
import { Calendar } from 'lucide-react';

const formatDayInfo = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  return {
    dayName: days[dateObj.getDay()],
    dayNumber: dateObj.getDate(),
    monthName: months[dateObj.getMonth()],
  };
};

const DateSelector = ({ availableDates = [], selectedDate, onSelectDate }) => {
  if (!availableDates || availableDates.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-brand-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Select Date
        </span>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {availableDates.map((dateStr) => {
          const { dayName, dayNumber, monthName } = formatDayInfo(dateStr);
          const isSelected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`flex flex-col items-center justify-center min-w-[72px] py-2.5 px-3 rounded-2xl border transition-all shrink-0 ${
                isSelected
                  ? 'bg-brand-600 border-brand-500 text-white font-bold shadow-lg shadow-brand-600/30 scale-105'
                  : 'bg-cinema-900 hover:bg-slate-800 border-slate-800/90 text-slate-300 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                {dayName}
              </span>
              <span className="text-lg font-black leading-tight my-0.5">{dayNumber}</span>
              <span className="text-[9px] font-bold uppercase opacity-75">{monthName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateSelector;
