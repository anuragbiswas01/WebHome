import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, Search, Trash2, CheckCircle2, Plus } from 'lucide-react';
import { useSearchEngines } from '../../hooks/useSearchEngines';

export const Route = createFileRoute('/settings/search')({
  component: SearchSettingsPage,
});

function SearchSettingsPage() {
  const { engines, addEngine, deleteEngine } = useSearchEngines();

  const [newEngine, setNewEngine] = useState({ name: '', url: '' });
  const [actionFeedback, setActionFeedback] = useState(null);

  const showFeedback = (msg) => {
    setActionFeedback({ msg });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleAddEngine = (e) => {
    e.preventDefault();
    if (!newEngine.name.trim() || !newEngine.url.trim()) return;
    if (!newEngine.url.includes('%s')) {
      alert('URL must include %s as query placeholder (e.g. https://google.com/search?q=%s)');
      return;
    }
    addEngine(newEngine.name.trim(), newEngine.url.trim());
    setNewEngine({ name: '', url: '' });
    showFeedback('Search engine added!');
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 text-text-primary">
      {/* Floating Action Feedback Notification */}
      {actionFeedback && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border bg-green-600/90 text-white border-green-400/30">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{actionFeedback.msg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/settings"
          className="p-2 rounded-full bg-bg-card/50 hover:bg-bg-input/80 backdrop-blur-sm transition-colors group shadow-sm"
        >
          <ArrowLeft className="w-6 h-6 text-text-primary group-hover:text-primary-orange" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold drop-shadow-sm">Search Engines</h1>
        </div>
      </div>

      <div className="space-y-6 pb-12">
        {/* Add New Engine (At the top, without outer card) */}
        <form onSubmit={handleAddEngine} className="space-y-3">
          <div className="flex items-center gap-2 text-primary-orange font-medium text-xs uppercase tracking-wider">
            <Plus className="w-3.5 h-3.5" />
            Add Search Engine
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder="Engine Name (e.g. GitHub)"
              value={newEngine.name}
              onChange={(e) => setNewEngine({ ...newEngine, name: e.target.value })}
              required
              className="sm:w-1/3 px-3.5 py-2.5 rounded-xl bg-bg-input border border-transparent focus:border-primary-orange focus:bg-bg-card text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
            />
            <input
              type="text"
              placeholder="Search URL with %s (e.g. https://github.com/search?q=%s)"
              value={newEngine.url}
              onChange={(e) => setNewEngine({ ...newEngine, url: e.target.value })}
              required
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-bg-input border border-transparent focus:border-primary-orange focus:bg-bg-card text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary-orange hover:bg-primary-orange-hover text-white rounded-xl font-semibold text-sm transition-all whitespace-nowrap active:scale-98 shadow-sm"
            >
              Add Engine
            </button>
          </div>
        </form>

        {/* Search Engines List (Below, clean list items without outer card) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-text-muted uppercase tracking-wider font-medium px-1">
            <span>Installed Engines</span>
            <span>{engines.length} total</span>
          </div>

          <div className="space-y-2">
            {engines.map((engine) => (
              <div
                key={engine.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-bg-input hover:bg-bg-input/80 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                  <div className="w-8 h-8 rounded-lg bg-bg-card flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                    <Search className="w-4 h-4 text-text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-text-primary text-sm truncate">{engine.name}</div>
                    <div className="text-xs text-text-muted truncate max-w-md font-mono">{engine.url}</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (engines.length <= 1) {
                      alert('You must have at least one search engine.');
                      return;
                    }
                    deleteEngine(engine.id);
                  }}
                  className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors shrink-0"
                  title="Delete Engine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
