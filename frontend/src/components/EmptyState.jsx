import React from 'react';
import { Film, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon = Film,
  title = 'No items found',
  description = 'Try adjusting your search query or filters to find what you are looking for.',
  actionText,
  actionLink,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-cinema-900/50 border border-slate-800/80 rounded-3xl max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-cinema-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-8 h-8 text-brand-500/80" />
      </div>
      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-6">{description}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
        >
          {actionText}
        </Link>
      )}
      {actionText && onActionClick && !actionLink && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
