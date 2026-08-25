import { useState, useEffect } from 'react';
import { X, Folder, ChevronRight } from 'lucide-react';
import { FolderSelectModal } from './FolderSelectModal';

function BookmarkModalForm({ onClose, onSave, initialData, availableFolders }) {
    const [formData, setFormData] = useState(() => ({
        title: initialData?.title || '',
        url: initialData?.url || '',
        folder: initialData?.folder || ''
    }));
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        let url = formData.url.trim();
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }
        onSave({ ...formData, url });
        onClose();
    };

    const handleSelectFolder = (selectedFolder) => {
        setFormData((prev) => ({ ...prev, folder: selectedFolder }));
    };

    return (
        <>
            <div
                className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-bg-card rounded-3xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100/50 sticky top-0 bg-bg-card z-10">
                    <h2 className="text-xl font-bold text-text-primary">
                        {initialData ? 'Edit Bookmark' : 'Add Bookmark'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-bg-input flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="My Bookmark"
                            required
                            className="w-full py-3 px-4 rounded-xl bg-bg-input border-2 border-transparent text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-orange focus:bg-bg-card transition-all"
                        />
                    </div>

                    {/* URL */}
                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">URL</label>
                        <input
                            type="text"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            placeholder="example.com"
                            required
                            className="w-full py-3 px-4 rounded-xl bg-bg-input border-2 border-transparent text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-orange focus:bg-bg-card transition-all"
                        />
                    </div>

                    {/* Folder Selection (Opens Dedicated Modal) */}
                    <div>
                        <label className="block text-sm font-semibold text-text-secondary mb-2">Folder</label>
                        <button
                            type="button"
                            onClick={() => setIsFolderModalOpen(true)}
                            className="w-full py-3 px-4 rounded-xl bg-bg-input hover:bg-bg-card border-2 border-transparent hover:border-gray-200 dark:hover:border-white/10 text-left flex items-center justify-between transition-all group"
                        >
                            <div className="flex items-center gap-2.5">
                                <Folder className="w-4 h-4 text-primary-orange" />
                                <span className={formData.folder ? 'text-text-primary font-medium' : 'text-text-muted'}>
                                    {formData.folder || 'Select or create folder'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-text-muted group-hover:text-primary-orange transition-colors font-medium">
                                <span>Change</span>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-bg-input text-text-primary font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-primary-orange text-white font-semibold shadow-orange hover:shadow-lg transition-all"
                        >
                            {initialData ? 'Save Changes' : 'Add Bookmark'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Dedicated Folder Select Modal */}
            <FolderSelectModal
                isOpen={isFolderModalOpen}
                onClose={() => setIsFolderModalOpen(false)}
                onSelectFolder={handleSelectFolder}
                currentFolder={formData.folder}
                availableFolders={availableFolders}
            />
        </>
    );
}

export function BookmarkModal({ isOpen, onClose, onSave, initialData, availableFolders }) {
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

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <BookmarkModalForm
                key={initialData ? initialData.id : 'new'}
                onClose={onClose}
                onSave={onSave}
                initialData={initialData}
                availableFolders={availableFolders}
            />
        </div>
    );
}
