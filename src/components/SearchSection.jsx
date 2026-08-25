import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Camera, X } from 'lucide-react';
import { QuickLinks } from './QuickLinks';

export function SearchSection({
    searchTerm,
    setSearchTerm,
    selectedEngineId,
    setSelectedEngineId,
    hasWallpaper,
    shortcuts = [],
    engines = [],
    onAddShortcut,
    onDeleteShortcut,
    onEditShortcut
}) {
    const [showEngineDropdown, setShowEngineDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Fallback to empty array if undefined
    const safeEngines = engines || [];
    const currentEngine = safeEngines.find(eng => eng.id === selectedEngineId) || safeEngines[0];

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowEngineDropdown(false);
            }
        };
        if (showEngineDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEngineDropdown]);

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
            if (engine.icon && typeof engine.icon !== 'string') {
                return engine.icon;
            }
            return <Search className="w-4 h-4 text-text-muted" />;
        }
    };

    const handleWebSearch = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            if (currentEngine) {
                window.open(currentEngine.url + encodeURIComponent(searchTerm), '_blank');
            }
        }
    };

    return (
        <div className="relative w-full z-40 mb-4 sm:mb-6 lg:mb-10">
            <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto px-1 sm:px-2">

                {/* Long Search Bar Pill */}
                <div className={`relative w-full transition-all duration-300 z-50 ${hasWallpaper ? 'brightness-100' : ''}`}>
                    <div className="relative flex items-center w-full h-12 sm:h-14 lg:h-15 px-3 sm:px-4 rounded-full bg-bg-card/95 dark:bg-[#181818] backdrop-blur-md shadow-md hover:shadow-xl border border-gray-200/60 dark:border-white/10 focus-within:border-primary-orange focus-within:ring-2 focus-within:ring-primary-orange/20 transition-all">

                        {/* Search Engine Selector (Left) */}
                        <div className="relative shrink-0 flex items-center mr-1 sm:mr-2" ref={dropdownRef}>
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
                                <div className="absolute top-full mt-3 left-0 min-w-52 bg-bg-card dark:bg-[#202020] rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-150 z-[100] border border-gray-200/60 dark:border-white/10 max-h-72 overflow-y-auto">
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
                            type="text"
                            placeholder={`Search with ${currentEngine?.name || 'Google'} or type a URL...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleWebSearch}
                            className="flex-1 min-w-0 h-full text-sm sm:text-base text-text-primary placeholder:text-text-muted focus:outline-none bg-transparent px-1"
                            autoFocus
                        />

                        {/* Clear Button (Shown when typing) */}
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="p-1.5 text-text-muted hover:text-text-primary rounded-full hover:bg-bg-input transition-colors mr-1"
                                title="Clear"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}

                        {/* Right Quick Tools (Lens) */}
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0 pl-1">
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
        </div>
    );
}
