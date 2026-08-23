import { Moon, Sun, Image, Eye, EyeOff, Menu, X, Settings, Cloud, RefreshCw, CloudOff, Database, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useBookmarks } from '../hooks/useBookmarks';

export function Header({
    theme,
    toggleTheme,
    onRefreshWallpaper,
    toggleWallpaperVisibility,
    isWallpaperVisible,
    onOpenSettings
}) {
    const { syncStatus } = useBookmarks();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="px-5 pt-5 pb-3 lg:px-12 lg:pt-6 lg:pb-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Mobile Sync Indicator */}
                <button
                    onClick={onOpenSettings}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-card/70 backdrop-blur-md shadow-sm border border-white/10 text-xs font-semibold text-text-primary"
                    title="Cloud Sync Status"
                >
                    {syncStatus === 'synced' && (
                        <>
                            <Cloud className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-[11px] text-green-600 dark:text-green-400">Synced</span>
                        </>
                    )}
                    {syncStatus === 'syncing' && (
                        <>
                            <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                            <span className="text-[11px] text-amber-600 dark:text-amber-400">Syncing</span>
                        </>
                    )}
                    {syncStatus === 'offline' && (
                        <>
                            <CloudOff className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[11px] text-gray-500">Offline</span>
                        </>
                    )}
                    {syncStatus === 'error' && (
                        <>
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-[11px] text-red-500">Sync Error</span>
                        </>
                    )}
                    {syncStatus === 'local-only' && (
                        <>
                            <Database className="w-3.5 h-3.5 text-primary-orange" />
                            <span className="text-[11px] text-text-secondary">Local</span>
                        </>
                    )}
                </button>

                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-10 h-10 rounded-xl bg-bg-card flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        {isMenuOpen ? <X className="w-5 h-5 text-text-primary" /> : <Menu className="w-5 h-5 text-text-primary" />}
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute right-0 top-12 flex flex-col gap-2 p-2 bg-bg-card rounded-2xl shadow-float border border-gray-100/50 animate-in fade-in slide-in-from-top-2 z-50 min-w-12">
                            <button
                                onClick={() => {
                                    onOpenSettings();
                                    setIsMenuOpen(false);
                                }}
                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-bg-input text-text-primary transition-colors"
                                title="Settings & Sync"
                            >
                                <Settings className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => {
                                    toggleWallpaperVisibility();
                                    setIsMenuOpen(false);
                                }}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isWallpaperVisible ? 'bg-primary-orange text-white shadow-orange' : 'hover:bg-bg-input text-text-primary'}`}
                                title={isWallpaperVisible ? "Hide Wallpaper" : "Show Wallpaper"}
                            >
                                {isWallpaperVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>

                            {isWallpaperVisible && (
                                <button
                                    onClick={() => {
                                        onRefreshWallpaper();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-bg-input text-text-primary transition-colors"
                                    title="Shuffle Wallpaper"
                                >
                                    <Image className="w-5 h-5" />
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    toggleTheme();
                                    setIsMenuOpen(false);
                                }}
                                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-bg-input text-text-primary transition-colors"
                                title="Toggle Theme"
                            >
                                {theme === 'light' ? (
                                    <Moon className="w-5 h-5" />
                                ) : (
                                    <Sun className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
