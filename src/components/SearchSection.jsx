import { useState, useRef, useEffect } from 'react';
import {
    ChevronDown,
    Camera,
    X,
    Bookmark as BookmarkIcon,
    Search,
    Globe,
    ArrowRight,
    Star,
    Folder,
} from 'lucide-react';
import { QuickLinks } from './QuickLinks';

export function SearchSection({
    searchTerm,
    setSearchTerm,
    selectedEngineId,
    setSelectedEngineId,
    hasWallpaper,
    shortcuts = [],
    bookmarks = [],
    engines = [],
    onAddShortcut,
    onDeleteShortcut,
    onEditShortcut
}) {
    const [isOverlayActive, setIsOverlayActive] = useState(false);
    const [showEngineDropdown, setShowEngineDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const normalInputRef = useRef(null);
    const overlayInputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Fallback to safe engines
    const safeEngines = engines || [];
    const currentEngine = safeEngines.find(eng => eng.id === selectedEngineId) || safeEngines[0];

    const trimmedQuery = (searchTerm || '').trim().toLowerCase();

    // Filter matching bookmarks & shortcuts
    const matchingBookmarks = trimmedQuery
        ? bookmarks
            .filter(b =>
                (b.title && b.title.toLowerCase().includes(trimmedQuery)) ||
                (b.url && b.url.toLowerCase().includes(trimmedQuery)) ||
                (b.folder && b.folder.toLowerCase().includes(trimmedQuery))
            )
            .slice(0, 8)
        : [];

    const matchingShortcuts = trimmedQuery
        ? shortcuts
            .filter(s =>
                (s.title && s.title.toLowerCase().includes(trimmedQuery)) ||
                (s.url && s.url.toLowerCase().includes(trimmedQuery))
            )
            .slice(0, 4)
        : [];

    // Check if query looks like a direct URL (e.g. "github.com", "reddit.com/r/react")
    const isDirectUrl = /^(https?:\/\/|[a-z0-9-]+\.[a-z]{2,})/i.test(trimmedQuery);

    const combinedResults = [
        ...matchingShortcuts.map(s => ({ ...s, itemType: 'shortcut' })),
        ...matchingBookmarks.map(b => ({ ...b, itemType: 'bookmark' })),
    ];

    // Total selectable index count: 0 is Web Search, 1+ is combinedResults
    const totalSelectableItems = 1 + combinedResults.length;

    // Body scroll lock when full-screen search overlay is open
    useEffect(() => {
        if (isOverlayActive) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOverlayActive]);

    // When overlay activates, auto-focus overlay input
    useEffect(() => {
        if (isOverlayActive) {
            setTimeout(() => {
                overlayInputRef.current?.focus();
            }, 50);
        }
    }, [isOverlayActive]);

    // Open overlay automatically if user types in normal input
    const handleNormalInputChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        if (val.trim()) {
            setIsOverlayActive(true);
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowEngineDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Global Keyboard Shortcuts (Ctrl+K or / to open search, 1-9 for speed dial)
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

            // Focus search on / or Ctrl+K / Cmd+K
            if ((e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) && !isTyping) {
                e.preventDefault();
                setIsOverlayActive(true);
                return;
            }

            // Speed dial numbers 1-9 to open corresponding shortcuts
            if (!isTyping && !e.ctrlKey && !e.altKey && !e.metaKey && !isOverlayActive) {
                const num = parseInt(e.key, 10);
                if (!isNaN(num) && num >= 1 && num <= 9) {
                    const targetShortcut = shortcuts[num - 1];
                    if (targetShortcut?.url) {
                        e.preventDefault();
                        window.open(targetShortcut.url, '_blank');
                    }
                }
            }
        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [shortcuts, isOverlayActive]);

    // Reset selection index when search query changes
    useEffect(() => {
        setSelectedIndex(0); // Default to Web Search (index 0)
    }, [trimmedQuery]);

    const getEngineIcon = (engine) => {
        if (!engine) return null;
        try {
            const domain = new URL(engine.url).hostname;
            return (
                <img
                    src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                    alt={engine.name}
                    className="w-5 h-5 object-contain"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            );
        } catch {
            return <Search className="w-4 h-4 text-text-muted" />;
        }
    };

    const getFavicon = (url) => {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        } catch {
            return null;
        }
    };

    const executeWebSearch = (query) => {
        const q = (query || searchTerm).trim();
        if (!q) return;

        if (isDirectUrl) {
            let fullUrl = q;
            if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
                fullUrl = 'https://' + fullUrl;
            }
            window.open(fullUrl, '_blank');
        } else if (currentEngine) {
            window.open(currentEngine.url + encodeURIComponent(q), '_blank');
        }
        setIsOverlayActive(false);
    };

    const openResult = (url) => {
        if (!url) return;
        window.open(url, '_blank');
        setIsOverlayActive(false);
    };

    const handleOverlayKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < totalSelectableItems - 1 ? prev + 1 : 0));
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalSelectableItems - 1));
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex === 0 || selectedIndex === -1) {
                executeWebSearch(searchTerm);
            } else {
                const item = combinedResults[selectedIndex - 1];
                if (item?.url) {
                    openResult(item.url);
                }
            }
            return;
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            setIsOverlayActive(false);
            return;
        }
    };

    const closeOverlaySafely = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsOverlayActive(false);
    };

    return (
        <div className="relative w-full z-40 mb-4 sm:mb-6 lg:mb-10">
            <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto px-1 sm:px-2">

                {/* Normal Homepage Search Bar */}
                <div className={`relative w-full transition-all duration-300 z-50 ${hasWallpaper ? 'brightness-100' : ''}`}>
                    <div
                        onClick={() => setIsOverlayActive(true)}
                        className="relative flex items-center w-full h-12 sm:h-14 lg:h-15 px-3 sm:px-4 rounded-full bg-bg-card/95 dark:bg-[#181818] backdrop-blur-md shadow-md hover:shadow-xl focus-within:ring-2 focus-within:ring-primary-orange/20 transition-all cursor-text"
                    >
                        {/* Search Engine Selector (Left) */}
                        <div className="relative shrink-0 flex items-center mr-1 sm:mr-2" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-bg-input text-text-secondary transition-colors"
                                onClick={() => setShowEngineDropdown(!showEngineDropdown)}
                                title={`Current search: ${currentEngine?.name || 'Search'}. Click to change.`}
                            >
                                <div className="w-5 h-5 flex items-center justify-center">
                                    {getEngineIcon(currentEngine)}
                                </div>
                                <ChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform duration-200 ${showEngineDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {showEngineDropdown && (
                                <div className="absolute top-full mt-3 left-0 min-w-52 bg-bg-card dark:bg-[#202020] rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 z-[100] max-h-72 overflow-y-auto">
                                    <div className="text-[11px] font-semibold text-text-muted px-3 py-1 uppercase tracking-wider">
                                        Search Engine
                                    </div>
                                    {safeEngines.map((engine) => {
                                        const isSelected = selectedEngineId === engine.id;
                                        return (
                                            <button
                                                key={engine.id}
                                                type="button"
                                                className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-colors ${isSelected
                                                    ? 'bg-primary-orange text-white'
                                                    : 'text-text-primary hover:bg-bg-input'
                                                    }`}
                                                onClick={() => {
                                                    setSelectedEngineId(engine.id);
                                                    setShowEngineDropdown(false);
                                                }}
                                            >
                                                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                                    {getEngineIcon(engine)}
                                                </div>
                                                <span className="truncate">{engine.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Extended Text Input */}
                        <input
                            ref={normalInputRef}
                            type="text"
                            placeholder={`Search with ${currentEngine?.name || 'Google'} or type a URL... (Press / to search)`}
                            value={searchTerm}
                            onChange={handleNormalInputChange}
                            onFocus={() => setIsOverlayActive(true)}
                            className="flex-1 min-w-0 h-full text-sm sm:text-base text-text-primary placeholder:text-text-muted focus:outline-none bg-transparent px-1 cursor-text"
                        />

                        {/* Clear Button */}
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchTerm('');
                                }}
                                className="p-1.5 text-text-muted hover:text-text-primary rounded-full hover:bg-bg-input transition-colors mr-1"
                                title="Clear"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}

                        {/* Right Quick Tools */}
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0 pl-1" onClick={(e) => e.stopPropagation()}>
                            <button
                                type="button"
                                className="p-2 text-text-muted hover:text-primary-orange hover:bg-bg-input rounded-full transition-colors hidden xs:flex"
                                title="Google Lens Search"
                                onClick={() => {
                                    window.open('https://images.google.com/', '_blank');
                                }}
                            >
                                <Camera className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Shortcuts / Quick Links */}
                <QuickLinks
                    shortcuts={shortcuts}
                    onAdd={onAddShortcut}
                    onDelete={onDeleteShortcut}
                    onEdit={onEditShortcut}
                />
            </div>

            {/* FULL-SCREEN CHROME-STYLE IMMERSIVE SEARCH UI OVERLAY */}
            {isOverlayActive && (
                <div
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-start bg-black/40 dark:bg-black/85 backdrop-blur-2xl px-3 sm:px-6 pt-8 sm:pt-16 pb-10 overflow-y-auto animate-in fade-in duration-150"
                    onMouseDown={closeOverlaySafely}
                >
                    <div
                        className="w-full max-w-3xl flex flex-col gap-3.5 animate-in zoom-in-95 duration-150"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Prominent Floating Search Bar Pill (Clean & Borderless) */}
                        <div className="relative flex items-center w-full h-14 sm:h-16 px-4 rounded-3xl bg-bg-card shadow-2xl transition-all">
                            {/* Engine Icon */}
                            <div className="shrink-0 mr-3 flex items-center">
                                <div className="w-8 h-8 rounded-xl bg-bg-input flex items-center justify-center shadow-xs">
                                    {getEngineIcon(currentEngine)}
                                </div>
                            </div>

                            {/* Main Typing Input */}
                            <input
                                ref={overlayInputRef}
                                type="text"
                                placeholder={`Search with ${currentEngine?.name || 'Google'} or jump to bookmarks...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleOverlayKeyDown}
                                className="flex-1 min-w-0 h-full text-base sm:text-lg font-medium text-text-primary placeholder:text-text-muted focus:outline-none bg-transparent"
                            />

                            {/* Action / Dismiss Buttons */}
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchTerm('');
                                            overlayInputRef.current?.focus();
                                        }}
                                        className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-bg-input transition-colors"
                                        title="Clear"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={closeOverlaySafely}
                                    className="px-3 py-1.5 rounded-xl bg-bg-input text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    title="Close Search (Esc)"
                                >
                                    ESC
                                </button>
                            </div>
                        </div>

                        {/* Search Engine Quick Switcher Chips (No Scrollbar, Light/Dark Adaptive) */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider shrink-0 mr-1">
                                Search on:
                            </span>
                            {safeEngines.map((engine) => {
                                const isSelected = selectedEngineId === engine.id;
                                return (
                                    <button
                                        key={engine.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedEngineId(engine.id);
                                            overlayInputRef.current?.focus();
                                        }}
                                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                                            isSelected
                                                ? 'bg-primary-orange text-white shadow-xs scale-102'
                                                : 'bg-bg-card hover:bg-bg-input text-text-secondary hover:text-text-primary shadow-xs'
                                        }`}
                                    >
                                        <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                            {getEngineIcon(engine)}
                                        </div>
                                        <span>{engine.name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Suggestions and Results Card (Light/Dark Adaptive) */}
                        <div className="w-full bg-bg-card rounded-3xl shadow-2xl p-3 sm:p-4 space-y-3">

                            {/* 1. Primary Web Search Option */}
                            <button
                                type="button"
                                onClick={() => executeWebSearch(searchTerm)}
                                onMouseEnter={() => setSelectedIndex(0)}
                                className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl text-left transition-all ${
                                    selectedIndex === 0
                                        ? 'bg-primary-orange text-white shadow-md'
                                        : 'bg-bg-input hover:bg-bg-input/80 text-text-primary'
                                }`}
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                                        selectedIndex === 0
                                            ? 'bg-white/20 text-white'
                                            : 'bg-primary-orange/15 text-primary-orange'
                                    }`}>
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm sm:text-base font-semibold truncate">
                                            {trimmedQuery ? (
                                                <span>
                                                    Search for &quot;<span className={selectedIndex === 0 ? 'text-white underline' : 'text-primary-orange'}>{searchTerm}</span>&quot;
                                                </span>
                                            ) : (
                                                <span>Type to search the web or bookmarks...</span>
                                            )}
                                        </div>
                                        <div className={`text-xs mt-0.5 ${
                                            selectedIndex === 0 ? 'text-white/80' : 'text-text-muted'
                                        }`}>
                                            {isDirectUrl ? 'Open website address directly' : `Web search with ${currentEngine?.name || 'Google'}`}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className={`text-xs font-mono px-2.5 py-1 rounded-xl ${
                                        selectedIndex === 0
                                            ? 'bg-white/20 text-white'
                                            : 'bg-bg-card text-text-muted shadow-xs'
                                    }`}>
                                        ↵ Enter
                                    </span>
                                </div>
                            </button>

                            {/* 2. Matching Bookmarks and Shortcuts List */}
                            {combinedResults.length > 0 && (
                                <div className="space-y-1.5 pt-2">
                                    <div className="flex items-center justify-between text-xs font-semibold text-text-muted px-2 py-1 uppercase tracking-wider">
                                        <span>Matching Bookmarks &amp; Shortcuts</span>
                                        <span>{combinedResults.length} found</span>
                                    </div>

                                    {combinedResults.map((item, idx) => {
                                        const itemSelectIndex = idx + 1;
                                        const isSelected = selectedIndex === itemSelectIndex;
                                        const favicon = getFavicon(item.url);

                                        return (
                                            <button
                                                key={item.id || idx}
                                                type="button"
                                                onClick={() => openResult(item.url)}
                                                onMouseEnter={() => setSelectedIndex(itemSelectIndex)}
                                                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                                                    isSelected
                                                        ? 'bg-primary-orange text-white shadow-md'
                                                        : 'hover:bg-bg-input text-text-primary'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0 pr-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 p-1.5 ${
                                                        isSelected ? 'bg-white/20' : 'bg-bg-input shadow-xs'
                                                    }`}>
                                                        {favicon ? (
                                                            <img
                                                                src={favicon}
                                                                alt=""
                                                                className="w-5 h-5 object-contain"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        ) : (
                                                            <BookmarkIcon className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-sm truncate flex items-center gap-2">
                                                            <span>{item.title || item.url}</span>
                                                            {item.starred && (
                                                                <Star className={`w-3.5 h-3.5 shrink-0 ${
                                                                    isSelected ? 'text-white fill-white' : 'text-amber-400 fill-amber-400'
                                                                }`} />
                                                            )}
                                                        </div>
                                                        <div className={`text-xs truncate font-mono mt-0.5 ${
                                                            isSelected ? 'text-white/80' : 'text-text-muted'
                                                        }`}>
                                                            {item.url}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2.5 shrink-0">
                                                    {item.folder && (
                                                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${
                                                            isSelected
                                                                ? 'bg-white/20 text-white'
                                                                : 'bg-bg-input text-text-muted'
                                                        }`}>
                                                            <Folder className="w-3 h-3" />
                                                            {item.folder}
                                                        </span>
                                                    )}
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                                        isSelected ? 'text-white' : 'text-text-muted'
                                                    }`}>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Keyboard Hints Footer */}
                            <div className="flex items-center justify-between text-[11px] text-text-muted pt-2 px-2">
                                <div className="flex items-center gap-3">
                                    <span><kbd className="px-1.5 py-0.5 rounded bg-bg-input font-mono">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-bg-input font-mono">↓</kbd> Navigate</span>
                                    <span><kbd className="px-1.5 py-0.5 rounded bg-bg-input font-mono">↵</kbd> Open / Search</span>
                                    <span><kbd className="px-1.5 py-0.5 rounded bg-bg-input font-mono">Esc</kbd> Close</span>
                                </div>
                                <span className="hidden sm:inline">WebHome Omnibox</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
