import { ChevronDown, Plus, Upload, Star, Info } from 'lucide-react';

export function BookmarkGrid({
    bookmarks,
    groupedBookmarks,
    expandedFolders,
    toggleFolder,
    viewMode = 'row',
    onOpenDetails,
    onToggleStar,
    onAdd,
    onImport
}) {
    const getDomain = (url) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    };

    if (bookmarks.length === 0) {
        return (
            <div className="text-center py-12 lg:py-10 px-6 bg-bg-card/30 backdrop-blur-md rounded-3xl border border-white/10 shadow-float my-3">
                <div className="text-5xl mb-3 animate-bounce">📑</div>
                <h2 className="text-xl font-semibold mb-1.5 text-text-primary">No bookmarks yet</h2>
                <p className="text-sm text-text-secondary mb-5 max-w-xs mx-auto">
                    Add your first bookmark or import from Chrome
                </p>
                <div className="flex gap-2.5 justify-center flex-wrap">
                    <button
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary-orange text-white text-sm font-semibold shadow-orange hover:bg-primary-orange-hover hover:-translate-y-0.5 transition-all"
                        onClick={onAdd}
                    >
                        <Plus className="w-4 h-4" />
                        Add Bookmark
                    </button>
                    <label className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-bg-card text-text-primary text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Import
                        <input type="file" accept=".html" onChange={onImport} hidden />
                    </label>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 sm:space-y-6">
            {Object.entries(groupedBookmarks).map(([folder, items]) => (
                <div key={folder} className="space-y-2.5">
                    {/* Folder Header */}
                    <div
                        className="flex items-center justify-between cursor-pointer select-none px-1 py-1"
                        onClick={() => toggleFolder(folder)}
                    >
                        <div className="flex items-center gap-2">
                            <div className={`transition-transform duration-200 ${expandedFolders[folder] !== false ? 'rotate-0' : '-rotate-90'}`}>
                                <ChevronDown className="w-4 h-4 text-text-muted" />
                            </div>
                            <h2 className="text-sm sm:text-base font-semibold text-text-primary">{folder}</h2>
                            <span className="px-2 py-0.5 rounded-full bg-primary-orange text-white text-[11px] font-semibold">
                                {items.length}
                            </span>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Open all ${items.length} bookmarks in "${folder}"?`)) {
                                    items.forEach(bookmark => window.open(bookmark.url, '_blank'));
                                }
                            }}
                            className="p-1.5 rounded-lg hover:bg-bg-card/60 text-text-secondary hover:text-text-primary transition-colors text-xs flex items-center gap-1.5"
                            title="Open All Bookmarks"
                        >
                            <span className="hidden sm:inline text-xs font-medium">Open all</span>
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-3.5 h-3.5"
                            >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                        </button>
                    </div>

                    {/* Bookmarks Display: Row View or Card View */}
                    {expandedFolders[folder] !== false && (
                        viewMode === 'card' ? (
                            /* Card View (2 cards in a row) */
                            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                                {items.map((bookmark) => (
                                    <div
                                        key={bookmark.id}
                                        className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-bg-card/90 dark:bg-bg-card/90 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-150"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            {/* Favicon Icon */}
                                            <a
                                                href={bookmark.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-bg-input flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5 overflow-hidden shadow-xs hover:scale-105 transition-transform"
                                            >
                                                <img
                                                    src={`https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=64`}
                                                    alt=""
                                                    className="w-5 h-5 object-contain"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerText = '🔗';
                                                    }}
                                                />
                                            </a>

                                            {/* Top Action Buttons (Star & Info) */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        onToggleStar(bookmark.id);
                                                    }}
                                                    className={`p-1.5 rounded-lg transition-all ${bookmark.starred
                                                        ? 'text-amber-400 bg-amber-400/10'
                                                        : 'text-text-muted hover:text-amber-400 hover:bg-bg-input opacity-100 sm:opacity-0 group-hover:opacity-100'
                                                        }`}
                                                    title={bookmark.starred ? "Unstar" : "Star"}
                                                >
                                                    <Star className={`w-3.5 h-3.5 ${bookmark.starred ? 'fill-amber-400' : ''}`} />
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        onOpenDetails(bookmark);
                                                    }}
                                                    className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-input opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Bookmark Info"
                                                >
                                                    <Info className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Title & URL */}
                                        <a
                                            href={bookmark.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col flex-1 min-w-0"
                                        >
                                            <span className="font-semibold text-xs sm:text-sm text-text-primary line-clamp-1 group-hover:text-primary-orange transition-colors">
                                                {bookmark.title}
                                            </span>
                                            <span className="text-[11px] sm:text-xs text-text-muted truncate mt-0.5">
                                                {getDomain(bookmark.url)}
                                            </span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Row View (Thin table-like cards) */
                            <div className="flex flex-col gap-1.5 sm:gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                {items.map((bookmark) => (
                                    <div
                                        key={bookmark.id}
                                        className="group relative flex items-center justify-between px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-bg-card/90 dark:bg-bg-card/90 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-150"
                                    >
                                        <a
                                            href={bookmark.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 flex-1 min-w-0 pr-2"
                                        >
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-bg-input flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5 overflow-hidden">
                                                <img
                                                    src={`https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=64`}
                                                    alt=""
                                                    className="w-4 h-4 sm:w-4.5 sm:h-4.5 object-contain"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerText = '🔗';
                                                    }}
                                                />
                                            </div>

                                            <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                                                <span className="font-semibold text-xs sm:text-sm text-text-primary truncate">
                                                    {bookmark.title}
                                                </span>
                                                <span className="text-[11px] sm:text-xs text-text-muted group-hover:text-primary-orange truncate transition-colors">
                                                    {bookmark.url}
                                                </span>
                                            </div>
                                        </a>

                                        {/* Action Buttons (Star & Info) */}
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onToggleStar(bookmark.id);
                                                }}
                                                className={`p-1.5 rounded-lg transition-all ${bookmark.starred
                                                    ? 'text-amber-400 bg-amber-400/10'
                                                    : 'text-text-muted hover:text-amber-400 hover:bg-bg-input opacity-100 sm:opacity-0 group-hover:opacity-100'
                                                    }`}
                                                title={bookmark.starred ? "Unstar" : "Star"}
                                            >
                                                <Star className={`w-3.5 h-3.5 ${bookmark.starred ? 'fill-amber-400' : ''}`} />
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onOpenDetails(bookmark);
                                                }}
                                                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-input transition-colors"
                                                title="Bookmark Info"
                                            >
                                                <Info className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            ))}
        </div>
    );
}
