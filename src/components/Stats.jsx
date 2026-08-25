import { Moon, Sun, Cloud, RefreshCw, CloudOff, Database, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useBookmarks } from '../hooks/useBookmarks';
import { useNavigate } from '@tanstack/react-router';

export function Stats({ theme, toggleTheme, username }) {
    const { user } = useAuth();
    const { syncStatus } = useBookmarks();
    const navigate = useNavigate();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const displayName = user?.displayName || username || 'User';

    return (
        <div className="hidden lg:flex gap-4 absolute top-6 left-12 z-20 text-text-primary select-none items-center">
            {user?.photoURL ? (
                <img
                    src={user.photoURL}
                    alt={displayName}
                    onClick={() => navigate({ to: '/settings' })}
                    className="w-11 h-11 rounded-full border-2 border-primary-orange shadow-md cursor-pointer hover:scale-105 transition-transform object-cover"
                    title="Account Settings"
                />
            ) : null}

            <div className="flex flex-col">
                <h1 className="text-3xl font-bold leading-none mb-1.5 shadow-black/20 drop-shadow-md flex items-center gap-2">
                    <span>{getGreeting()},</span>
                    <span className="text-primary-orange">{displayName}</span>
                </h1>

                <div className="flex items-center gap-2.5 mt-0.5">
                    <span className="text-xs font-semibold opacity-90 tracking-wide shadow-black/20 drop-shadow-sm">
                        Personal Dashboard
                    </span>
                    <span className="text-xs opacity-60">•</span>

                    {/* Sync Status Badge */}
                    <button
                        onClick={() => navigate({ to: '/settings' })}
                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/25 hover:bg-black/40 backdrop-blur-md text-[11px] font-medium transition-all border border-white/10 hover:border-white/20 shadow-sm"
                        title="Cloud Sync Status (Click to open Settings)"
                    >
                        {syncStatus === 'synced' && (
                            <>
                                <Cloud className="w-3 h-3 text-green-400" />
                                <span className="text-green-300">Synced</span>
                            </>
                        )}
                        {syncStatus === 'syncing' && (
                            <>
                                <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                                <span className="text-amber-300">Syncing...</span>
                            </>
                        )}
                        {syncStatus === 'offline' && (
                            <>
                                <CloudOff className="w-3 h-3 text-gray-300" />
                                <span className="text-gray-300">Offline</span>
                            </>
                        )}
                        {syncStatus === 'error' && (
                            <>
                                <AlertCircle className="w-3 h-3 text-red-400" />
                                <span className="text-red-300">Sync Error</span>
                            </>
                        )}
                        {syncStatus === 'local-only' && (
                            <>
                                <Database className="w-3 h-3 text-primary-orange" />
                                <span className="text-white/80">Local</span>
                            </>
                        )}
                    </button>

                    <span className="text-xs opacity-60">•</span>

                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-1.5 text-xs font-semibold opacity-90 hover:opacity-100 transition-opacity hover:text-primary-orange shadow-black/20 drop-shadow-sm"
                    >
                        {theme === 'light' ? (
                            <>
                                <Moon className="w-3 h-3" />
                                <span>Dark Mode</span>
                            </>
                        ) : (
                            <>
                                <Sun className="w-3 h-3" />
                                <span>Light Mode</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
