import { useState, useEffect } from 'react';
import { X, FolderPlus, Folder, Check } from 'lucide-react';

export function FolderSelectModal({
    isOpen,
    onClose,
    onSelectFolder,
    currentFolder = '',
    availableFolders = []
}) {
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    // Prevent background scrolling while modal is open
    useEffect(() => {
        if (!isOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow || 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCreate = (e) => {
        e?.preventDefault();
        const trimmed = newFolderName.trim();
        if (trimmed) {
            onSelectFolder(trimmed);
            setNewFolderName('');
            setIsCreatingFolder(false);
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm bg-bg-card rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-primary-orange/15 text-primary-orange flex items-center justify-center">
                            <Folder className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-text-primary">Select Folder</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl hover:bg-bg-input text-text-secondary transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {/* Create New Folder Button / Form */}
                    {isCreatingFolder ? (
                        <form onSubmit={handleCreate} className="p-3 bg-bg-input rounded-2xl border border-primary-orange/40 space-y-2">
                            <label className="text-xs font-semibold text-text-secondary block">New Folder Name</label>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="e.g. Design Inspiration"
                                autoFocus
                                required
                                className="w-full py-2 px-3 rounded-xl bg-bg-card text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-orange border border-black/5 dark:border-white/5"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCreatingFolder(false);
                                        setNewFolderName('');
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-3.5 py-1.5 rounded-lg bg-primary-orange text-white text-xs font-semibold shadow-xs hover:bg-primary-orange-hover transition-colors"
                                >
                                    Create & Select
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsCreatingFolder(true)}
                            className="w-full flex items-center gap-2.5 p-3 rounded-2xl border border-dashed border-primary-orange/40 text-primary-orange hover:bg-primary-orange/10 font-semibold text-xs transition-colors"
                        >
                            <FolderPlus className="w-4 h-4" />
                            <span>Create New Folder</span>
                        </button>
                    )}

                    {/* No Folder Option */}
                    <button
                        type="button"
                        onClick={() => {
                            onSelectFolder('');
                            onClose();
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-medium transition-all ${!currentFolder
                            ? 'bg-primary-orange text-white shadow-orange/30'
                            : 'bg-bg-input hover:bg-bg-card text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <Folder className="w-4 h-4 opacity-75" />
                            <span>No Folder (Uncategorized)</span>
                        </div>
                        {!currentFolder && <Check className="w-4 h-4" />}
                    </button>

                    {/* Existing Folders List */}
                    {availableFolders.map((folder) => {
                        const isSelected = currentFolder === folder;
                        return (
                            <button
                                key={folder}
                                type="button"
                                onClick={() => {
                                    onSelectFolder(folder);
                                    onClose();
                                }}
                                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-medium transition-all ${isSelected
                                    ? 'bg-primary-orange text-white shadow-orange/30'
                                    : 'bg-bg-input hover:bg-bg-card text-text-primary'
                                    }`}
                            >
                                <div className="flex items-center gap-2.5 truncate">
                                    <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-primary-orange'}`} />
                                    <span className="truncate">{folder}</span>
                                </div>
                                {isSelected && <Check className="w-4 h-4 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
