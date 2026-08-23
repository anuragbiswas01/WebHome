import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  User,
  Save,
  Upload,
  Download,
  ArrowLeft,
  Moon,
  Sun,
  AlertTriangle,
  Search,
  Trash2,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  Shield,
  Layers,
  Database,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Mail,
  Lock,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBookmarks } from '../hooks/useBookmarks';
import { useSearchEngines } from '../hooks/useSearchEngines';
import { useTheme } from '../hooks/useTheme';
import { useWallpaper } from '../hooks/useWallpaper';
import { parseBookmarkHTML, generateBookmarkHTML } from '../hooks/useBookmarks';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function formatLastSynced(timestamp) {
  if (!timestamp) return 'Never';
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const {
    user,
    authError,
    authSettings,
    isFirebaseConfigured,
    signInWithGoogle,
    signInAnonymouslyUser,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
    clearAuthError,
  } = useAuth();

  const {
    bookmarks,
    shortcuts,
    syncStatus,
    lastSyncedAt,
    syncError,
    autoSyncEnabled,
    setAutoSyncEnabled,
    syncNow,
    pushLocalToCloud,
    pullCloudToLocal,
    mergeLocalAndCloud,
    importBookmarks,
    resetBookmarks,
  } = useBookmarks();

  const { engines, addEngine, deleteEngine, importEngines, resetEngines } = useSearchEngines();
  const { wallpaper } = useWallpaper();

  const [username, setUsername] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('username') || 'User';
    }
    return 'User';
  });

  const [tempName, setTempName] = useState(username);
  const [newEngine, setNewEngine] = useState({ name: '', url: '' });
  const [isSyncingAction, setIsSyncingAction] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);

  // Email / Password Form State initialized with master credentials by default
  const [authEmail, setAuthEmail] = useState(authSettings.adminEmail || '');
  const [authPassword, setAuthPassword] = useState(authSettings.adminPassword || '');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const showFeedback = (msg, type = 'success') => {
    setActionFeedback({ msg, type });
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleEmailAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;
    setIsAuthSubmitting(true);
    try {
      if (isSignUpMode) {
        await signUpWithEmail(authEmail, authPassword);
        showFeedback('Account created & signed in successfully!');
      } else {
        try {
          await signInWithEmail(authEmail, authPassword);
          showFeedback('Signed in successfully!');
        } catch (signInErr) {
          // If account doesn't exist yet on fresh Firebase, auto-create master account
          if (
            (signInErr.code === 'auth/user-not-found' ||
              signInErr.code === 'auth/invalid-credential' ||
              signInErr.code === 'auth/invalid-login-credentials') &&
            authEmail === authSettings.adminEmail &&
            authPassword === authSettings.adminPassword
          ) {
            await signUpWithEmail(authEmail, authPassword);
            showFeedback('Master account initialized & signed in!');
          } else {
            throw signInErr;
          }
        }
      }
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUsername(tempName);
    localStorage.setItem('username', tempName);
    showFeedback('Profile saved successfully!');
  };

  const handleManualSync = async () => {
    setIsSyncingAction(true);
    try {
      await syncNow();
      showFeedback('Synced successfully with Firebase Cloud!');
    } catch (err) {
      showFeedback(`Sync failed: ${err.message}`, 'error');
    } finally {
      setIsSyncingAction(false);
    }
  };

  const handlePushToCloud = async () => {
    if (window.confirm('This will overwrite cloud bookmarks with your current local bookmarks. Continue?')) {
      setIsSyncingAction(true);
      try {
        await pushLocalToCloud();
        showFeedback('Local bookmarks uploaded to Cloud!');
      } catch (err) {
        showFeedback(`Push failed: ${err.message}`, 'error');
      } finally {
        setIsSyncingAction(false);
      }
    }
  };

  const handlePullFromCloud = async () => {
    if (window.confirm('This will replace current local bookmarks with bookmarks from Firebase Cloud. Continue?')) {
      setIsSyncingAction(true);
      try {
        await pullCloudToLocal();
        showFeedback('Cloud bookmarks downloaded to local!');
      } catch (err) {
        showFeedback(`Pull failed: ${err.message}`, 'error');
      } finally {
        setIsSyncingAction(false);
      }
    }
  };

  const handleMergeData = async () => {
    setIsSyncingAction(true);
    try {
      await mergeLocalAndCloud();
      showFeedback('Merged local and cloud bookmarks seamlessly!');
    } catch (err) {
      showFeedback(`Merge failed: ${err.message}`, 'error');
    } finally {
      setIsSyncingAction(false);
    }
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseBookmarkHTML(e.target?.result);
      const incomingEngines = parsed.filter((b) => b.folder === 'Search Engines');

      importBookmarks(parsed);
      if (incomingEngines.length > 0) {
        importEngines(incomingEngines.map((eng) => ({ name: eng.title, url: eng.url })));
      }

      showFeedback(`Successfully imported ${parsed.length} items!`);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleExport = () => {
    const html = generateBookmarkHTML(bookmarks, shortcuts, engines);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `webhome-bookmarks-${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('Bookmarks exported to HTML file!');
  };

  const handleAddEngine = (e) => {
    e.preventDefault();
    if (newEngine.name && newEngine.url) {
      addEngine(newEngine);
      setNewEngine({ name: '', url: '' });
      showFeedback('Search engine added!');
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden transition-all duration-500 ease-in-out bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage: wallpaper ? `url(${wallpaper})` : undefined,
        backgroundColor: !wallpaper ? 'var(--color-bg-solid)' : undefined,
      }}
    >
      <div
        className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 ${
          wallpaper ? 'bg-black/40 backdrop-blur-md' : ''
        }`}
      />

      {/* Floating Action Feedback Notification */}
      {actionFeedback && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border ${
              actionFeedback.type === 'error'
                ? 'bg-red-500/90 text-white border-red-400/30'
                : 'bg-green-600/90 text-white border-green-400/30'
            }`}
          >
            {actionFeedback.type === 'error' ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm font-semibold">{actionFeedback.msg}</span>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8 text-text-primary">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/"
            className="p-2 rounded-full bg-bg-card/50 hover:bg-bg-input/80 backdrop-blur-sm transition-colors group shadow-sm"
          >
            <ArrowLeft className="w-6 h-6 text-text-primary group-hover:text-primary-orange" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold drop-shadow-sm">Settings</h1>
            <p className="text-xs text-text-muted">Manage your sync, appearance, and bookmarks</p>
          </div>
        </div>

        <div className="space-y-6 pb-12">
          {/* ======================================================== */}
          {/* Section: Firebase Cloud Sync & Account */}
          {/* ======================================================== */}
          <div className="bg-bg-card rounded-2xl p-6 shadow-sm border border-gray-100/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-primary-orange font-medium text-sm uppercase tracking-wider">
                <Cloud className="w-4 h-4" />
                Firebase Cloud Sync
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                {syncStatus === 'synced' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Synced
                  </span>
                )}
                {syncStatus === 'syncing' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Syncing...
                  </span>
                )}
                {syncStatus === 'offline' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <CloudOff className="w-3 h-3" />
                    Offline (Cached)
                  </span>
                )}
                {syncStatus === 'error' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    Sync Error
                  </span>
                )}
                {syncStatus === 'local-only' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                    <Database className="w-3 h-3" />
                    Local Mode
                  </span>
                )}
              </div>
            </div>

            {/* Auth / Configuration State */}
            {!isFirebaseConfigured ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-sm">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Firebase Credentials Not Set in .env</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300/90 leading-relaxed">
                        Your bookmarks and settings are currently operating in high-performance local storage mode.
                        To enable real-time cloud sync across your devices, configure your Firebase keys in the project’s <code className="px-1 py-0.5 bg-black/10 rounded font-mono text-xs">.env</code> file.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collapsible Setup Guide */}
                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowConfigHelp(!showConfigHelp)}
                    className="w-full flex items-center justify-between p-3.5 bg-bg-input text-left text-xs font-semibold text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary-orange" />
                      How to connect your Firebase Project (3 minutes)
                    </span>
                    {showConfigHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showConfigHelp && (
                    <div className="p-4 space-y-3 text-xs text-text-secondary bg-bg-card leading-relaxed">
                      <ol className="list-decimal list-inside space-y-2">
                        <li>
                          Open <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-primary-orange underline inline-flex items-center gap-1 font-medium">Firebase Console <ExternalLink className="w-3 h-3" /></a> and create or choose a project.
                        </li>
                        <li>
                          Enable <strong>Authentication</strong> with <strong>Google</strong> and <strong>Anonymous</strong> providers.
                        </li>
                        <li>
                          Create a <strong>Cloud Firestore</strong> database (in test or production mode).
                        </li>
                        <li>
                          Under <strong>Project Settings &gt; General &gt; Your Apps</strong>, create a Web App and copy the config values into your <code className="font-mono bg-bg-input px-1 py-0.5 rounded">.env</code> file.
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            ) : user ? (
              /* Signed In User View */
              <div className="space-y-5">
                {/* User Card */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-bg-input border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3.5">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-12 h-12 rounded-full border-2 border-primary-orange object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-orange text-white font-bold text-lg flex items-center justify-center shadow-orange">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-text-primary text-base flex items-center gap-2">
                        {user.displayName || 'Guest User'}
                        {user.isAnonymous && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                            Guest
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-text-muted truncate max-w-56">{user.email || 'Anonymous Cloud Session'}</div>
                      <div className="text-[11px] text-text-muted mt-0.5">
                        Last synced: <span className="font-medium text-text-primary">{formatLastSynced(lastSyncedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={signOutUser}
                    className="p-2.5 rounded-xl text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                {/* Auto Sync Toggle & Sync Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-bg-input">
                    <div>
                      <div className="text-sm font-semibold text-text-primary">Auto-Sync Changes</div>
                      <div className="text-xs text-text-muted">Real-time background sync</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSyncEnabled}
                        onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-orange"></div>
                    </label>
                  </div>

                  <button
                    onClick={handleManualSync}
                    disabled={isSyncingAction || syncStatus === 'syncing'}
                    className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-primary-orange text-white font-semibold text-sm shadow-orange hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncingAction ? 'animate-spin' : ''}`} />
                    Sync Now
                  </button>
                </div>

                {/* End-to-End Encryption Badge */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 flex items-start gap-3">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      Client-Side AES-256 Encryption Active
                    </div>
                    <p className="text-emerald-700/80 dark:text-emerald-400/80 mt-0.5 leading-relaxed text-[11px]">
                      Your bookmarks are encrypted in your browser using a key derived from your account before upload. Neither Firebase nor third parties can read your stored URLs or titles.
                    </p>
                  </div>
                </div>

                {/* Advanced Cloud Actions */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    Advanced Sync Options
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={handleMergeData}
                      disabled={isSyncingAction}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-bg-input hover:bg-gray-200 dark:hover:bg-gray-700 text-text-primary transition-colors disabled:opacity-50"
                    >
                      Smart Merge
                    </button>
                    <button
                      onClick={handlePushToCloud}
                      disabled={isSyncingAction}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-bg-input hover:bg-gray-200 dark:hover:bg-gray-700 text-text-primary transition-colors disabled:opacity-50"
                    >
                      Force Upload
                    </button>
                    <button
                      onClick={handlePullFromCloud}
                      disabled={isSyncingAction}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-bg-input hover:bg-gray-200 dark:hover:bg-gray-700 text-text-primary transition-colors disabled:opacity-50"
                    >
                      Force Download
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {(syncError || authError) && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-between text-xs text-red-600 dark:text-red-400">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{syncError || authError}</span>
                    </div>
                    <button
                      onClick={() => {
                        clearAuthError();
                      }}
                      className="font-semibold underline ml-2"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Signed Out View */
              <div className="space-y-5">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Sign in to automatically encrypt and sync your bookmarks, folders, and shortcuts across all your devices.
                </p>

                {/* Social / Direct Auth Buttons */}
                {(authSettings.enableGoogle || authSettings.enableGuest) && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {authSettings.enableGoogle && (
                      <button
                        onClick={signInWithGoogle}
                        disabled={isAuthSubmitting}
                        className="flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-bg-input hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/50 text-text-primary font-semibold text-sm shadow-sm transition-all active:scale-98 disabled:opacity-50"
                      >
                        {/* Google 'G' Logo SVG */}
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                        Sign In with Google
                      </button>
                    )}

                    {authSettings.enableGuest && (
                      <button
                        onClick={signInAnonymouslyUser}
                        disabled={isAuthSubmitting}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bg-input hover:bg-gray-200 dark:hover:bg-gray-700 text-text-secondary text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <Shield className="w-4 h-4" />
                        Guest Mode
                      </button>
                    )}
                  </div>
                )}

                {/* Email / Password Form */}
                {authSettings.enableEmail && (
                  <form
                    onSubmit={handleEmailAuthSubmit}
                    className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        {isSignUpMode ? 'Create Sync Account' : 'Email & Password Login'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSignUpMode(!isSignUpMode)}
                        className="text-xs text-primary-orange hover:underline font-medium"
                      >
                        {isSignUpMode ? 'Have an account? Sign In' : 'New? Create Account'}
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <div className="relative">
                        <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          placeholder="Email address"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-input border border-transparent focus:border-primary-orange text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
                        />
                      </div>

                      <div className="relative">
                        <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          placeholder="Password (min 6 characters)"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-input border border-transparent focus:border-primary-orange text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthSubmitting}
                      className="w-full py-3 rounded-xl bg-primary-orange hover:bg-primary-orange-hover text-white text-sm font-semibold shadow-orange hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      {isSignUpMode ? 'Register' : 'Sign In'}
                    </button>
                  </form>
                )}

                {authError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-xs text-red-600 dark:text-red-400 flex items-center justify-between">
                    <span>{authError}</span>
                    <button onClick={clearAuthError} className="font-semibold underline ml-2">Dismiss</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* Section: Profile */}
          {/* ======================================================== */}
          <div className="bg-bg-card rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-center gap-2 mb-4 text-primary-orange font-medium text-sm uppercase tracking-wider">
              <User className="w-4 h-4" />
              Profile
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
                    disabled={tempName === username}
                    className="px-5 py-2.5 bg-primary-orange text-white rounded-xl shadow-orange hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* ======================================================== */}
          {/* Section: Appearance */}
          {/* ======================================================== */}
          <div className="bg-bg-card rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-center gap-2 mb-4 text-accent-purple font-medium text-sm uppercase tracking-wider">
              <Sun className="w-4 h-4" />
              Appearance
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-text-primary font-medium">Theme Mode</span>
                <p className="text-xs text-text-muted">Toggle between Light and Dark interface styles</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-input hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Light Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* Section: Search Engines */}
          {/* ======================================================== */}
          <div className="bg-bg-card rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-center gap-2 mb-4 text-primary-orange font-medium text-sm uppercase tracking-wider">
              <Search className="w-4 h-4" />
              Search Engines
            </div>

            <div className="space-y-4">
              {/* List Existing */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {engines.map((engine) => (
                  <div key={engine.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-input">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-1.5 shadow-sm">
                        <Search className="w-4 h-4 text-text-secondary" />
                      </div>
                      <div>
                        <div className="font-semibold text-text-primary text-sm">{engine.name}</div>
                        <div className="text-xs text-text-muted truncate max-w-48">{engine.url}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEngine(engine.id)}
                      className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Delete Engine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New */}
              <form onSubmit={handleAddEngine} className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-sm font-semibold mb-3">Add Custom Engine</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Name (e.g. GitHub)"
                    value={newEngine.name}
                    onChange={(e) => setNewEngine({ ...newEngine, name: e.target.value })}
                    required
                    className="basis-1/3 grow px-3 py-2.5 rounded-xl bg-bg-input border border-transparent focus:border-primary-orange focus:bg-bg-card text-sm outline-none transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Search URL with %s query placeholder"
                    value={newEngine.url}
                    onChange={(e) => setNewEngine({ ...newEngine, url: e.target.value })}
                    required
                    className="basis-2/3 grow px-3 py-2.5 rounded-xl bg-bg-input border border-transparent focus:border-primary-orange focus:bg-bg-card text-sm outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-primary-orange text-white rounded-xl shadow-orange hover:shadow-lg transition-all font-semibold text-sm whitespace-nowrap"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ======================================================== */}
          {/* Section: Data & Backup */}
          {/* ======================================================== */}
          <div className="bg-bg-card rounded-2xl p-6 shadow-sm border border-gray-100/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-accent-teal font-medium text-sm uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                Data &amp; Backup
              </div>
              <span className="text-xs text-text-muted font-medium">
                {bookmarks.length} Bookmarks • {shortcuts.length} Shortcuts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-4 p-4 rounded-xl bg-bg-input hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent hover:border-primary-orange/20 cursor-pointer transition-all group">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-text-primary">Import Bookmarks</div>
                  <div className="text-xs text-text-muted">From Chrome / HTML file</div>
                </div>
                <input type="file" accept=".html" onChange={handleImport} hidden />
              </label>

              <button
                onClick={handleExport}
                disabled={bookmarks.length === 0 && shortcuts.length === 0}
                className="flex items-center gap-4 p-4 rounded-xl bg-bg-input hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-transparent hover:border-primary-orange/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-text-primary">Export Bookmarks</div>
                  <div className="text-xs text-text-muted">Netscape HTML format</div>
                </div>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* Section: Danger Zone */}
          {/* ======================================================== */}
          <div className="bg-bg-card rounded-2xl p-6 shadow-sm border border-red-100/50">
            <div className="flex items-center gap-2 mb-4 text-red-500 font-medium text-sm uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-text-primary">Reset All Local &amp; Synced Data</div>
                <div className="text-xs text-text-muted">
                  Clears all bookmarks, shortcuts, and custom engines permanently.
                </div>
              </div>
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
    </div>
  );
}
