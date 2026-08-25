import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ArrowLeft,
  Cloud,
  CloudOff,
  RefreshCw,
  AlertCircle,
  Database,
  LogOut,
  Shield,
  Mail,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBookmarks } from '../../hooks/useBookmarks';

export const Route = createFileRoute('/settings/sync')({
  component: SyncSettingsPage,
});

function formatLastSynced(date) {
  if (!date) return 'Never';
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SyncSettingsPage() {
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
    syncStatus,
    lastSyncedAt,
    syncError,
    autoSyncEnabled,
    setAutoSyncEnabled,
    syncNow,
    pushLocalToCloud,
    pullCloudToLocal,
    mergeLocalAndCloud,
  } = useBookmarks();

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [isSyncingAction, setIsSyncingAction] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const showFeedback = (msg, type = 'success') => {
    setActionFeedback({ msg, type });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleEmailAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;

    setIsAuthSubmitting(true);
    try {
      if (isSignUpMode) {
        await signUpWithEmail(authEmail, authPassword);
        showFeedback('Account created & synced!');
      } else {
        await signInWithEmail(authEmail, authPassword);
        showFeedback('Signed in successfully!');
      }
      setAuthPassword('');
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncingAction(true);
    try {
      await syncNow();
      showFeedback('Sync complete!');
    } catch (err) {
      showFeedback(err.message || 'Sync failed', 'error');
    } finally {
      setIsSyncingAction(false);
    }
  };

  const handleMergeData = async () => {
    setIsSyncingAction(true);
    try {
      await mergeLocalAndCloud();
      showFeedback('Data merged successfully!');
    } catch (err) {
      showFeedback(err.message || 'Merge failed', 'error');
    } finally {
      setIsSyncingAction(false);
    }
  };

  const handlePushToCloud = async () => {
    if (!window.confirm('Overwrite cloud data with your local bookmarks?')) return;
    setIsSyncingAction(true);
    try {
      await pushLocalToCloud();
      showFeedback('Local data pushed to cloud!');
    } catch (err) {
      showFeedback(err.message || 'Push failed', 'error');
    } finally {
      setIsSyncingAction(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!window.confirm('Overwrite local bookmarks with your cloud data?')) return;
    setIsSyncingAction(true);
    try {
      await pullCloudToLocal();
      showFeedback('Cloud data pulled to local!');
    } catch (err) {
      showFeedback(err.message || 'Pull failed', 'error');
    } finally {
      setIsSyncingAction(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 text-text-primary">
      {/* Floating Action Feedback Notification */}
      {actionFeedback && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md ${
              actionFeedback.type === 'error'
                ? 'bg-red-500/90 text-white'
                : 'bg-green-600/90 text-white'
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

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/settings"
          className="p-2 rounded-full bg-bg-card/50 hover:bg-bg-input/80 backdrop-blur-sm transition-colors group shadow-sm"
        >
          <ArrowLeft className="w-6 h-6 text-text-primary group-hover:text-primary-orange" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold drop-shadow-sm">Cloud Sync & Account</h1>
        </div>
      </div>

      <div className="space-y-4 pb-12">
        {/* Main Sync Card */}
        <div className="bg-bg-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-orange font-medium text-sm uppercase tracking-wider">
              <Cloud className="w-4 h-4" />
              Firebase Sync
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
                  Offline
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

          {/* State check */}
          {!isFirebaseConfigured ? (
            <div className="p-3.5 rounded-xl bg-bg-input text-xs text-text-muted flex items-center justify-between">
              <span>Local Storage Mode Active</span>
              <span className="text-[11px] opacity-75">Add Firebase keys to .env for multi-device sync</span>
            </div>
          ) : user ? (
            /* Signed In User View */
            <div className="space-y-4">
              {/* User Card */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-bg-input">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-11 h-11 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary-orange text-white font-bold text-base flex items-center justify-center shadow-orange">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-text-primary text-sm flex items-center gap-2">
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
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Auto Sync Toggle & Sync Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-bg-input">
                  <div className="text-sm font-semibold text-text-primary">Auto-Sync</div>
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
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Client-Side AES-256 Encryption Active</span>
              </div>

              {/* Advanced Cloud Actions */}
              <div className="pt-2 space-y-2">
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
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-between text-xs text-red-600 dark:text-red-400">
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
            <div className="space-y-4">
              {/* Social / Direct Auth Buttons */}
              {(authSettings.enableGoogle || authSettings.enableGuest) && (
                <div className="flex flex-col sm:flex-row gap-3">
                  {authSettings.enableGoogle && (
                    <button
                      onClick={signInWithGoogle}
                      disabled={isAuthSubmitting}
                      className="flex-1 flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-bg-input hover:bg-gray-200 dark:hover:bg-gray-700 text-text-primary font-semibold text-sm shadow-sm transition-all active:scale-98 disabled:opacity-50"
                    >
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
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bg-input hover:bg-gray-200 dark:hover:bg-gray-700 text-text-primary font-semibold text-sm transition-all active:scale-98 disabled:opacity-50"
                    >
                      Guest Session
                    </button>
                  )}
                </div>
              )}

              {/* Email / Password Form */}
              {authSettings.enableEmail && (
                <form
                  onSubmit={handleEmailAuthSubmit}
                  className="pt-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      {isSignUpMode ? 'Create Sync Account' : 'Email Login'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSignUpMode(!isSignUpMode)}
                      className="text-xs text-primary-orange hover:underline font-medium"
                    >
                      {isSignUpMode ? 'Sign In' : 'Create Account'}
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-input text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-input text-sm text-text-primary placeholder:text-text-muted outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthSubmitting}
                    className="w-full py-3 rounded-xl bg-primary-orange hover:bg-primary-orange-hover text-white text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
}
