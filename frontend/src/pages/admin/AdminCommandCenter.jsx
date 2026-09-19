import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  TrendingUp,
  CornerDownLeft,
  Loader2,
  BarChart3,
  Calendar,
  Ticket,
  ShieldCheck,
  Building2,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import VoiceInputButton from '../../components/command/VoiceInputButton';
import CommandResultCard from '../../components/command/CommandResultCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const adminPromptChips = [
  "Show today's revenue",
  'How many tickets were sold today?',
  'Which movie has the highest occupancy?',
  "Show today's cancelled bookings",
  'Show theatre performance',
  'Show revenue this week',
];

export default function AdminCommandCenter() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runAdminQuery = async (textToRun) => {
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
        message: error.message || 'Failed to execute admin query.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-500" />
            <span>Admin Intelligence Command Center</span>
          </h1>
          <p className="text-xs text-slate-400">
            Query multiplex earnings, booking velocity, screening occupancy, and audit stats via natural language.
          </p>
        </div>
      </div>

      {/* Query Bar Card */}
      <Card className="bg-cinema-900 border-slate-800">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runAdminQuery();
            }}
            className="flex items-center gap-2 bg-cinema-950 p-2 rounded-2xl border border-slate-800 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5 text-brand-400" />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask admin intelligence... (e.g. 'Show today\'s revenue' or 'Which movie has highest occupancy?')"
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 py-2 focus:outline-none"
            />

            <VoiceInputButton
              disabled={loading}
              onSpeechResult={(text) => {
                setQuery(text);
                runAdminQuery(text);
              }}
            />

            <Button
              type="submit"
              disabled={!query.trim() || loading}
              className="shrink-0 gap-1.5 font-bold shadow-md shadow-brand-600/30"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Query</span>}
              <CornerDownLeft className="w-3.5 h-3.5" />
            </Button>
          </form>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400">Sample Inquiries:</span>
            {adminPromptChips.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(prompt);
                  runAdminQuery(prompt);
                }}
                className="px-2.5 py-1 rounded-lg bg-cinema-850 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-800 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Result Container */}
      {loading && (
        <div className="py-14 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs font-bold text-slate-300 animate-pulse">
            Analyzing MongoDB Atlas aggregation pipeline...
          </p>
        </div>
      )}

      {result && !loading && (
        <div className="animate-in fade-in duration-300 max-w-3xl">
          <CommandResultCard
            data={result}
            rawInput={query}
            onExecuteCommand={(text) => {
              setQuery(text);
              runAdminQuery(text);
            }}
          />
        </div>
      )}
    </div>
  );
}
