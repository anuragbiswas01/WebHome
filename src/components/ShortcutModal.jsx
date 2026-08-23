import { useState } from 'react';
import { X } from 'lucide-react';

function ShortcutModalForm({ onClose, onSave, initialData }) {
    const [formData, setFormData] = useState(() => ({
        title: initialData?.title || '',
        url: initialData?.url || ''
    }));

    const handleSubmit = (e) => {
        e.preventDefault();

        let url = formData.url.trim();
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }

        let title = formData.title.trim();
        if (!title) {
            try {
                title = new URL(url).hostname;
            } catch {
                title = 'Shortcut';
            }
        }

        onSave({ title, url });
        onClose();
    };

    return (
        <div
            className="w-full lg:max-w-md bg-bg-card rounded-t-3xl lg:rounded-2xl shadow-float"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100/50">
                <h2 className="text-xl font-bold text-text-primary">
                    {initialData ? 'Edit Shortcut' : 'Add Shortcut'}
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
                    <label className="block text-sm font-semibold text-text-secondary mb-2">Name</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. YouTube"
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
                        placeholder="e.g. https://youtube.com"
                        required
                        className="w-full py-3 px-4 rounded-xl bg-bg-input border-2 border-transparent text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-orange focus:bg-bg-card transition-all"
                    />
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
                        {initialData ? 'Save' : 'Add'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export function ShortcutModal({ isOpen, onClose, onSave, initialData }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end lg:items-center justify-center p-0 lg:p-4 z-100"
            onClick={onClose}
        >
            <ShortcutModalForm
                key={initialData ? initialData.id : 'new'}
                onClose={onClose}
                onSave={onSave}
                initialData={initialData}
            />
        </div>
    );
}
