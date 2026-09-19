import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  CornerDownLeft,
  Loader2,
  Film,
  Armchair,
  Ticket,
  ShoppingBag,
  DollarSign,
  Star,
  Mic,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import VoiceInputButton from './VoiceInputButton';
import CommandResultCard from './CommandResultCard';
import { Button } from '../ui/button';

const samplePrompts = [
  'Find 2 action movies tonight under ₹600',
  'Find 3 seats together near center',
  'Find a Telugu movie tonight under ₹500',
  'Add 2 popcorns and 2 drinks',
  'Show my bookings',
  '/movies telugu',
];

export default function CommandCenterEmbed() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRun = async (textToRun) => {
    const text = textToRun || query;
    if (!text.trim() || loading) return;

    try {
      setLoading(true);
      setResult(null);

      const res = await api.post('/commands/parse', { command: text.trim() });
      if (res.success) {
        setResult(res.data);
      }
    } catch (error) {
      setResult({
        type: 'ERROR',
        message: error.message || 'Failed to process command.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-3xl border border-brand-500/30 bg-gradient-to-b from-cinema-900 via-cinema-950 to-cinema-950 p-6 sm:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-400 text-xs font-black uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Intelligent Cinema Copilot</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          SmartCine Command Center
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Book tickets, find the best center seats, pick food combos, and plan group budgets using natural language.
        </p>
      </div>

      {/* Input Box */}
      <div className="relative z-10 max-w-2xl mx-auto space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRun();
          }}
          className="relative rounded-2xl border border-slate-700/80 bg-cinema-900/90 shadow-2xl backdrop-blur-md p-2 flex items-center gap-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all"
        >
          <div className="pl-3 text-slate-500">
            <Search className="w-5 h-5 text-brand-500" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask SmartCine... (e.g., 'Find 2 action movies tonight under ₹600')"
            className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 py-2 focus:outline-none"
          />

          <VoiceInputButton
            disabled={loading}
            onSpeechResult={(text) => {
              setQuery(text);
              handleRun(text);
            }}
          />

          <Button
            type="submit"
            disabled={!query.trim() || loading}
            className="shrink-0 gap-1.5 font-bold shadow-lg shadow-brand-600/30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Ask</span>}
            <CornerDownLeft className="w-3.5 h-3.5" />
          </Button>
        </form>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-slate-400">Try asking:</span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(prompt);
                handleRun(prompt);
              }}
              className="px-2.5 py-1 rounded-full bg-cinema-850 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-800 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Result Area */}
        {loading && (
          <div className="py-10 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
            <p className="text-xs font-semibold text-slate-400 animate-pulse">
              Computing optimal seats, showtimes & prices...
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="pt-4 animate-in fade-in duration-300">
            <CommandResultCard
              data={result}
              rawInput={query}
              onExecuteCommand={(text) => {
                setQuery(text);
                handleRun(text);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
