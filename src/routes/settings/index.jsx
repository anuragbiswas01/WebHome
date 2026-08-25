import { createFileRoute, Link } from '@tanstack/react-router';
import {
  ArrowLeft,
  User,
  Cloud,
  Sun,
  Moon,
  Clock as ClockIcon,
  Search,
  Layers,
  ChevronRight,
  Database,
  RefreshCw,
  AlertCircle,
  CloudOff,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useClockSettings } from '../../hooks/useClockSettings';
import { useSearchEngines } from '../../hooks/useSearchEngines';
import { useTheme } from '../../hooks/useTheme';

export const Route = createFileRoute('/settings/')({
  component: SettingsHubPage,
});

function SettingsHubPage() {
  const { user, isFirebaseConfigured } = useAuth();
  const { bookmarks, username, syncStatus } = useBookmarks();
  const { theme, primaryColor } = useTheme();
  const { showClock, clockFormat } = useClockSettings();
  const { engines } = useSearchEngines();

  // Profile auth status determination
  const getProfileStatusBadge = () => {
    if (!isFirebaseConfigured) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400">
          <Database className="w-3 h-3" />
          Local
        </span>
      );
    }
    if (user) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400">
          <UserCheck className="w-3 h-3" />
          {user.isAnonymous ? 'Guest' : 'Logged In'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
        <UserX className="w-3 h-3" />
        Logged Out
      </span>
    );
  };

  const settingsLinks = [
    {
      to: '/settings/profile',
      title: 'Profile',
      description: username || 'User',
      icon: User,
      iconColor: 'text-blue-500 bg-blue-500/10',
      badge: getProfileStatusBadge(),
    },
    {
      to: '/settings/sync',
      title: 'Cloud Sync & Account',
      description: 'Firebase real-time sync & encryption',
      icon: Cloud,
      iconColor: 'text-primary-orange bg-primary-orange/10',
      badge: (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {!isFirebaseConfigured ? (
            <span className="text-text-muted flex items-center gap-1">
              <Database className="w-3 h-3 text-blue-500" />
              Local Mode
            </span>
          ) : syncStatus === 'synced' ? (
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Synced
            </span>
          ) : syncStatus === 'syncing' ? (
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Syncing
            </span>
          ) : syncStatus === 'offline' ? (
            <span className="text-text-muted flex items-center gap-1">
              <CloudOff className="w-3 h-3" />
              Offline
            </span>
          ) : syncStatus === 'error' ? (
            <span className="text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Error
            </span>
          ) : (
            <span className="text-text-muted">{user ? 'Active' : 'Sign In'}</span>
          )}
        </div>
      ),
    },
    {
      to: '/settings/appearance',
      title: 'Appearance',
      description: 'Theme mode & primary accent color',
      icon: theme === 'dark' ? Moon : Sun,
      iconColor: 'text-accent-purple bg-accent-purple/10',
      badge: (
        <div className="flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-full shadow-xs"
            style={{ backgroundColor: primaryColor }}
            title="Primary Accent Color"
          />
          <span className="text-xs font-medium text-text-muted capitalize">
            {theme}
          </span>
        </div>
      ),
    },
    {
      to: '/settings/clock',
      title: 'Clock & Header',
      description: 'Digital clock visibility & 12h/24h format',
      icon: ClockIcon,
      iconColor: 'text-amber-500 bg-amber-500/10',
      badge: (
        <span className="text-xs font-medium text-text-muted">
          {!showClock ? 'Hidden' : clockFormat === '12h' ? '12-Hour' : '24-Hour'}
        </span>
      ),
    },
    {
      to: '/settings/search',
      title: 'Search Engines',
      description: 'Custom search engines & placeholders',
      icon: Search,
      iconColor: 'text-emerald-500 bg-emerald-500/10',
      badge: (
        <span className="text-xs font-medium text-text-muted">
          {engines.length} {engines.length === 1 ? 'engine' : 'engines'}
        </span>
      ),
    },
    {
      to: '/settings/data',
      title: 'Data & Backup',
      description: 'Import, export & reset bookmarks',
      icon: Layers,
      iconColor: 'text-accent-teal bg-accent-teal/10',
      badge: (
        <span className="text-xs font-medium text-text-muted">
          {bookmarks.length} {bookmarks.length === 1 ? 'item' : 'items'}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 text-text-primary">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/"
          className="p-2 rounded-full bg-bg-card/50 hover:bg-bg-input/80 backdrop-blur-sm transition-colors group shadow-sm"
        >
          <ArrowLeft className="w-6 h-6 text-text-primary group-hover:text-primary-orange" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold drop-shadow-sm">Settings</h1>
        </div>
      </div>

      {/* Navigation Menu Tiles */}
      <div className="space-y-2.5 pb-12">
        {settingsLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center justify-between p-4 rounded-2xl bg-bg-card hover:bg-bg-input/80 transition-all group shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${item.iconColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-text-primary text-sm group-hover:text-primary-orange transition-colors">
                    {item.title}
                  </div>
                  {item.to === '/settings/profile' && username && (
                    <div className="text-xs text-text-muted">{username}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.badge}
                <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary-orange group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
