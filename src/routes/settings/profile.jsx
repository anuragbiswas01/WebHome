import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, User, Save, CheckCircle2 } from 'lucide-react';
import { useBookmarks } from '../../hooks/useBookmarks';

export const Route = createFileRoute('/settings/profile')({
  component: ProfileSettingsPage,
});

function ProfileSettingsPage() {
  const { username, setUsername } = useBookmarks();
  const [tempName, setTempName] = useState(username || 'User');
  const [actionFeedback, setActionFeedback] = useState(null);

  const showFeedback = (msg) => {
    setActionFeedback({ msg });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    setUsername(tempName.trim());
    showFeedback('Profile saved successfully!');
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
          <h1 className="text-2xl font-bold drop-shadow-sm">Profile</h1>
        </div>
      </div>

      <div className="space-y-4 pb-12">
        <div className="bg-bg-card rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-primary-orange font-medium text-sm uppercase tracking-wider">
            <User className="w-4 h-4" />
            Profile Details
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Display Name</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-bg-input border border-transparent focus:border-primary-orange focus:bg-bg-card font-medium text-text-primary outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={tempName === username || !tempName.trim()}
                  className="px-5 py-2.5 bg-primary-orange text-white rounded-xl shadow-orange hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 font-semibold"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
