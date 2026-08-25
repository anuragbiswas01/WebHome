import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ArrowLeft,
  Layers,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useSearchEngines } from '../../hooks/useSearchEngines';
import { generateBookmarkHTML, parseBookmarkHTML } from '../../utils/bookmarkUtils';

export const Route = createFileRoute('/settings/data')({
  component: DataSettingsPage,
});

function DataSettingsPage() {
  const { bookmarks, shortcuts, importBookmarks, resetBookmarks } = useBookmarks();
  const { resetEngines } = useSearchEngines();

  const [actionFeedback, setActionFeedback] = useState(null);

  const showFeedback = (msg) => {
    setActionFeedback({ msg });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const html = event.target.result;
        const imported = parseBookmarkHTML(html);
        if (imported.length > 0) {
          importBookmarks(imported);
          showFeedback(`Imported ${imported.length} bookmarks!`);
        } else {
          showFeedback('No bookmarks found in file', 'error');
        }
      } catch (err) {
        showFeedback(err.message || 'Failed to parse file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExport = () => {
    const html = generateBookmarkHTML(bookmarks, shortcuts);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webhome_bookmarks_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('Bookmarks exported!');
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
          <h1 className="text-2xl font-bold drop-shadow-sm">Data & Backup</h1>
        </div>
      </div>

      <div className="space-y-4 pb-12">
        {/* Import / Export Card */}
        <div className="bg-bg-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent-teal font-medium text-sm uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              Backup & Restore
            </div>
            <span className="text-xs text-text-muted font-medium">
              {bookmarks.length} Bookmarks • {shortcuts.length} Shortcuts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3.5 p-3.5 rounded-xl bg-bg-input hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-primary-orange/20 cursor-pointer transition-all group">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div className="font-semibold text-text-primary text-sm">Import Bookmarks</div>
              <input type="file" accept=".html" onChange={handleImport} hidden />
            </label>

            <button
              onClick={handleExport}
              disabled={bookmarks.length === 0 && shortcuts.length === 0}
              className="flex items-center gap-3.5 p-3.5 rounded-xl bg-bg-input hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-primary-orange/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="font-semibold text-text-primary text-sm">Export Bookmarks</div>
            </button>
          </div>
        </div>

        {/* Danger Zone Card */}
        <div className="bg-bg-card rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-red-500 font-medium text-sm uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="font-semibold text-text-primary text-sm">Reset All Local & Synced Data</div>
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to delete all bookmarks and shortcuts? This cannot be undone.'
                  )
                ) {
                  resetBookmarks();
                  resetEngines();
                  showFeedback('All data has been reset.');
                }
              }}
              disabled={bookmarks.length === 0 && shortcuts.length === 0}
              className="px-4 py-2 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Reset Everything
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
