import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Search,
  X,
  History,
  CornerDownLeft,
  Loader2,
  Film,
  Armchair,
  Ticket,
  ShoppingBag,
  DollarSign,
  Star,
  Zap,
  HelpCircle,
} from 'lucide-react';
import api from '../../services/api';
import VoiceInputButton from './VoiceInputButton';
import CommandResultCard from './CommandResultCard';
import { Dialog, DialogContent } from '../ui/dialog';

const quickChips = [
  { icon: Film, label: 'Movies', query: 'Find 2 action movies tonight under ₹600' },
  { icon: Armchair, label: 'Seats', query: 'Find the best seats for 2 people' },
  { icon: Ticket, label: 'Bookings', query: 'Show my bookings' },
  { icon: ShoppingBag, label: 'Food', query: 'Add 2 popcorns and 2 drinks' },
  { icon: DollarSign, label: 'Budget', query: 'Find a Telugu movie tonight under ₹500' },
  { icon: Star, label: 'Recommendations', query: 'Recommend top rated movies' },
];

const slashSuggestions = [
  { cmd: '/movies', desc: 'Browse trending and now-showing movies' },
  { cmd: '/showtimes', desc: 'Check upcoming schedules and timings' },
  { cmd: '/seats', desc: 'Find adjacent seats or check layout' },
  { cmd: '/bestseat', desc: 'Auto-find optimal center seats' },
  { cmd: '/mybookings', desc: 'View your digital tickets & QR passes' },
  { cmd: '/food', desc: 'Explore concessions & combo deals' },
  { cmd: '/offers', desc: 'Check active discount promo codes' },
  { cmd: '/help', desc: 'View full natural language guide' },
];

export default function CommandCenterModal({ isOpen, onClose }) {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smartcine_cmd_history') || '[]');
    } catch {
      return [];
    }
  });
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Ctrl + K / Cmd + K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const executeCommand = async (cmdText) => {
    const textToRun = cmdText || command;
    if (!textToRun.trim() || loading) return;

    try {
      setLoading(true);
      setResult(null);

      const res = await api.post('/commands/parse', { command: textToRun.trim() });
      if (res.success) {
        setResult(res.data);

        // Update history
        setHistory((prev) => {
          const updated = [textToRun.trim(), ...prev.filter((c) => c !== textToRun.trim())].slice(0, 5);
          localStorage.setItem('smartcine_cmd_history', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      setResult({
        type: 'ERROR',
        message: error.message || 'Failed to process command. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeCommand();
  };

  const handleQuickChip = (query) => {
    setCommand(query);
    executeCommand(query);
  };

  const showSlashMenu = command.startsWith('/');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-cinema-900 border-slate-800 p-0 overflow-hidden shadow-2xl">
        {/* Command Search Input Bar */}
        <form onSubmit={handleFormSubmit} className="relative border-b border-slate-800 flex items-center px-4 bg-cinema-950">
          <Sparkles className="w-5 h-5 text-brand-500 shrink-0 mr-3 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Ask SmartCine... (e.g. 'Find 2 action movies tonight under ₹600' or '/movies')"
            className="w-full bg-transparent py-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <VoiceInputButton
              disabled={loading}
              onSpeechResult={(spokenText) => {
                setCommand(spokenText);
                executeCommand(spokenText);
              }}
            />

            <button
              type="submit"
              disabled={!command.trim() || loading}
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 transition-all shadow-md shadow-brand-600/30"
              title="Run Command"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CornerDownLeft className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[65vh] overflow-y-auto scrollbar-thin">
          {/* Slash Commands Dropdown Preview */}
          {showSlashMenu && (
            <div className="p-2 rounded-xl bg-cinema-950 border border-brand-500/30 space-y-1">
              <p className="text-[10px] font-black uppercase text-brand-400 px-2 py-1">Quick Slash Commands</p>
              {slashSuggestions
                .filter((s) => s.cmd.startsWith(command.toLowerCase()))
                .map((s) => (
                  <button
                    key={s.cmd}
                    type="button"
                    onClick={() => {
                      setCommand(s.cmd);
                      executeCommand(s.cmd);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-left text-xs transition-colors"
                  >
                    <span className="font-bold text-brand-300">{s.cmd}</span>
                    <span className="text-slate-400 text-[11px]">{s.desc}</span>
                  </button>
                ))}
            </div>
          )}

          {/* Quick Suggestions Chips */}
          {!result && !loading && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Suggestions</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {quickChips.map((chip, idx) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickChip(chip.query)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-cinema-850 hover:bg-slate-800 border border-slate-800/80 text-left transition-all group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-brand-300 truncate">
                          {chip.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Commands History */}
          {!result && !loading && history.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3 h-3 text-slate-500" />
                Recent Commands
              </p>
              <div className="space-y-1">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-cinema-850 text-xs text-slate-300 group"
                  >
                    <span className="truncate">{h}</span>
                    <button
                      onClick={() => {
                        setCommand(h);
                        executeCommand(h);
                      }}
                      className="text-[10px] text-brand-400 font-bold opacity-0 group-hover:opacity-100 hover:underline shrink-0 ml-2"
                    >
                      Run Again ↵
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading Animation */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div>
                <Sparkles className="w-5 h-5 text-brand-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-slate-300 animate-pulse">
                SmartCine is analyzing showtimes, seats & pricing...
              </p>
            </div>
          )}

          {/* Result Output Card */}
          {result && !loading && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <CommandResultCard
                data={result}
                rawInput={command}
                onExecuteCommand={(cmdText) => {
                  setCommand(cmdText);
                  executeCommand(cmdText);
                }}
              />
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-cinema-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
              Ctrl + K
            </span>
            <span>to open anytime</span>
          </div>
          <span className="text-slate-500">Press Esc to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
