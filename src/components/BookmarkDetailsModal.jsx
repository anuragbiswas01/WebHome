import { useState } from 'react';
import { X, Star, ExternalLink, Copy, Check, Folder, Edit3, Trash2, ChevronDown, FolderPlus } from 'lucide-react';

export function BookmarkDetailsModal({
    isOpen,
    onClose,
    bookmark,
    availableFolders = [],
    onToggleStar,
    onEdit,
    onDelete,
    onUpdateFolder
}) {
    const [copied, setCopied] = useState(false);
    const [showFolderDropdown, setShowFolderDropdown] = useState(false);
    const [newFolderInput, setNewFolderInput] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    if (!isOpen || !bookmark) return null;

    const getDomain = (url) => {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url;
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(bookmark.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSelectFolder = (folderName) => {
        onUpdateFolder(bookmark.id, folderName);
        setShowFolderDropdown(false);
    };

    const handleCreateFolder = () => {
        if (newFolderInput.trim()) {
            onUpdateFolder(bookmark.id, newFolderInput.trim());
            setNewFolderInput('');
            setIsCreatingFolder(false);
            setShowFolderDropdown(false);
        }
    };

    const isStarred = !!bookmark.starred;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-bg-card rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-bg-input flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5 shadow-xs overflow-hidden">
                            <img
                                src={`https://www.google.com/s2/favicons?domain=${getDomain(bookmark.url)}&sz=64`}
                                alt=""
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerText = '🌐';
                                }}
                            />
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                Bookmark Info
                            </h3>
                            <p className="text-xs text-text-secondary">
                                {getDomain(bookmark.url)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Star Button */}
                        <button
                            onClick={() => onToggleStar(bookmark.id)}
                            className={`p-2 rounded-xl transition-all ${isStarred
                                ? 'bg-amber-400/20 text-amber-500'
                                : 'hover:bg-bg-input text-text-muted hover:text-amber-500'
                                }`}
                            title={isStarred ? "Remove from Starred" : "Add to Starred"}
                        >
                            <Star className={`w-5 h-5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-bg-input text-text-secondary transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">
                    {/* Title */}
                    <div>
                        <h2 className="text-lg font-bold text-text-primary break-words">
                            {bookmark.title}
                        </h2>
                    </div>

                    {/* URL Pill & Copy */}
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-bg-input border border-black/5 dark:border-white/5">
                        <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-orange hover:underline truncate flex-1 min-w-0 font-medium"
                            title={bookmark.url}
                        >
                            {bookmark.url}
                        </a>
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={handleCopy}
                                className="p-1.5 rounded-lg bg-bg-card hover:bg-white dark:hover:bg-zinc-700 text-text-secondary hover:text-text-primary transition-all shadow-xs"
                                title="Copy URL"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <a
                                href={bookmark.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-bg-card hover:bg-white dark:hover:bg-zinc-700 text-text-secondary hover:text-primary-orange transition-all shadow-xs"
                                title="Open in new tab"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    {/* Folder Management */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                            Folder
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-bg-input hover:bg-bg-card border border-transparent hover:border-gray-200 dark:hover:border-white/10 text-xs font-medium text-text-primary transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-primary-orange" />
                                    <span>{bookmark.folder || 'Uncategorized'}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${showFolderDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showFolderDropdown && (
                                <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-bg-card rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 p-2 max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                                    {availableFolders.map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => handleSelectFolder(f)}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${bookmark.folder === f
                                                ? 'bg-primary-orange/15 text-primary-orange font-semibold'
                                                : 'hover:bg-bg-input text-text-primary'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 truncate">
                                                <Folder className="w-3.5 h-3.5" />
                                                <span className="truncate">{f}</span>
                                            </div>
                                            {bookmark.folder === f && <Check className="w-3.5 h-3.5" />}
                                        </button>
                                    ))}

                                    {!isCreatingFolder ? (
                                        <button
                                            onClick={() => setIsCreatingFolder(true)}
                                            className="w-full mt-1.5 pt-2 border-t border-gray-100 dark:border-white/5 flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-primary-orange hover:bg-primary-orange/10 font-semibold transition-colors"
                                        >
                                            <FolderPlus className="w-3.5 h-3.5" />
                                            <span>New Folder</span>
                                        </button>
                                    ) : (
                                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5 space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Folder name..."
                                                value={newFolderInput}
                                                onChange={(e) => setNewFolderInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                                autoFocus
                                                className="w-full px-3 py-1.5 rounded-lg text-xs bg-bg-input text-text-primary focus:outline-none focus:ring-1 focus:ring-primary-orange"
                                            />
                                            <div className="flex justify-end gap-1.5">
                                                <button
                                                    onClick={() => setIsCreatingFolder(false)}
                                                    className="px-2.5 py-1 text-xs text-text-muted hover:text-text-primary"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleCreateFolder}
                                                    className="px-3 py-1 bg-primary-orange text-white text-xs font-semibold rounded-lg shadow-xs"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-5 pt-3 bg-bg-input/50 border-t border-gray-100 dark:border-white/5 flex items-center justify-between gap-3">
                    <button
                        onClick={() => {
                            if (window.confirm(`Delete bookmark "${bookmark.title}"?`)) {
                                onDelete(bookmark.id);
                                onClose();
                            }
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                onEdit(bookmark);
                                onClose();
                            }}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-bg-card hover:bg-white dark:hover:bg-zinc-700 text-text-primary border border-black/5 dark:border-white/10 shadow-xs transition-all"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit</span>
                        </button>
                        <a
                            href={bookmark.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary-orange text-white shadow-orange hover:shadow-lg transition-all"
                        >
                            <span>Open</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
