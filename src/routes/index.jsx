import { Settings, Image, LayoutGrid, List, Star, Folder, Layers, Filter } from 'lucide-react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useBookmarks, parseBookmarkHTML } from '../hooks/useBookmarks';
import { useSearchEngines } from '../hooks/useSearchEngines';
import { useWallpaper } from '../hooks/useWallpaper';
import { Header } from '../components/Header';
import { SearchSection } from '../components/SearchSection';
import { BookmarkGrid } from '../components/BookmarkGrid';
import { RecentBookmarks } from '../components/RecentBookmarks';
import { BookmarkModal } from '../components/BookmarkModal';
import { BookmarkDetailsModal } from '../components/BookmarkDetailsModal';
import { ShortcutModal } from '../components/ShortcutModal';
import { Clock } from '../components/Clock';
import { Stats } from '../components/Stats';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { bookmarks, shortcuts, addBookmark, updateBookmark, deleteBookmark, toggleStarBookmark, importBookmarks, addShortcut, deleteShortcut, updateShortcut } = useBookmarks();
  const { engines, importEngines } = useSearchEngines();
  const { wallpaper, fetchNewWallpaper } = useWallpaper();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBookmarkForDetails, setSelectedBookmarkForDetails] = useState(null);

  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedEngineId, setSelectedEngineId] = useState('google');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Bookmark View mode: 'card' | 'row'
  const [bookmarkView, setBookmarkView] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('webhome_bookmark_view') || 'row';
    }
    return 'row';
  });

  useEffect(() => {
    localStorage.setItem('webhome_bookmark_view', bookmarkView);
  }, [bookmarkView]);

  // Username State
  const [username] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('username') || 'User';
    }
    return 'User';
  });

  // Wallpaper Visibility State
  const [isWallpaperVisible, setIsWallpaperVisible] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('isWallpaperVisible');
      return stored !== null ? JSON.parse(stored) : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('isWallpaperVisible', JSON.stringify(isWallpaperVisible));
  }, [isWallpaperVisible]);

  // Derived State
  const folders = [...new Set(bookmarks.map((b) => b.folder || 'Uncategorized'))];
  const starredBookmarks = bookmarks.filter((b) => b.starred);

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.folder || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'starred') return !!b.starred;
    return (b.folder || 'Uncategorized') === activeFilter;
  });

  const groupedBookmarks = filteredBookmarks.reduce((acc, bookmark) => {
    const folder = bookmark.folder || 'Uncategorized';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(bookmark);
    return acc;
  }, {});

  // Handlers
  const toggleFolder = (folder) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folder]: prev[folder] === undefined ? false : !prev[folder],
    }));
  };

  const handleOpenDetails = (bookmark) => {
    setSelectedBookmarkForDetails(bookmark);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateFolder = (bookmarkId, newFolder) => {
    updateBookmark(bookmarkId, { folder: newFolder });
    setSelectedBookmarkForDetails((prev) => (prev && prev.id === bookmarkId ? { ...prev, folder: newFolder } : prev));
  };

  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseBookmarkHTML(e.target?.result);
      const incomingEngines = parsed.filter(b => b.folder === 'Search Engines');

      importBookmarks(parsed);
      if (incomingEngines.length > 0) {
        importEngines(incomingEngines.map(e => ({ name: e.title, url: e.url })));
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const openAddModal = () => {
    setEditingBookmark(null);
    setIsModalOpen(true);
  };

  const openEditModal = (bookmark) => {
    setEditingBookmark(bookmark);
    setIsModalOpen(true);
  };

  const handleSaveBookmark = (formData) => {
    if (editingBookmark) {
      updateBookmark(editingBookmark.id, formData);
    } else {
      addBookmark(formData);
    }
  };

  const toggleWallpaperVisibility = () => {
    if (!isWallpaperVisible && !wallpaper) {
      // If turning on and no wallpaper set, fetch one
      fetchNewWallpaper();
    }
    setIsWallpaperVisible(!isWallpaperVisible);
  };

  const activeWallpaper = isWallpaperVisible ? wallpaper : null;

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Fixed Hardware-Accelerated Background Layer (Zero Scroll Jitter) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-500 ease-in-out"
        style={{
          backgroundImage: activeWallpaper ? `url(${activeWallpaper})` : undefined,
          backgroundColor: !activeWallpaper ? 'var(--color-bg-solid)' : undefined,
        }}
      >
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeWallpaper ? 'bg-black/10' : ''}`} />
      </div>

      {/* Desktop Specific Elements */}
      <Stats
        theme={theme}
        toggleTheme={toggleTheme}
        username={username}
      />

      {/* Desktop Clock Position - Aligned with Stats (Top Right) */}
      <div className="hidden lg:flex absolute top-6 right-16 z-20 flex-col items-end justify-center">
        <Clock theme={theme} hasWallpaper={!!activeWallpaper} />
      </div>

      {/* Desktop Bottom Controls (Wallpaper & Settings) */}
      <div className="hidden lg:flex absolute bottom-8 right-12 z-20 gap-3">
        {isWallpaperVisible && (
          <button
            onClick={fetchNewWallpaper}
            className="p-2.5 rounded-xl bg-bg-card/30 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-all shadow-float hover:shadow-lg group"
            title="Shuffle Wallpaper"
          >
            <Image className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        )}

        <button
          onClick={() => navigate({ to: '/settings' })}
          className="p-2.5 rounded-xl bg-bg-card/30 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-all shadow-float hover:shadow-lg group"
          title="Settings"
        >
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
        </button>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header - Mobile only */}
        <div className="lg:hidden">
          <Header
            theme={theme}
            toggleTheme={toggleTheme}
            onRefreshWallpaper={fetchNewWallpaper}
            toggleWallpaperVisibility={toggleWallpaperVisibility}
            isWallpaperVisible={isWallpaperVisible}
            username={username}
            onOpenSettings={() => navigate({ to: '/settings' })}
          />
        </div>

        {/* Mobile Clock */}
        <div className="lg:hidden">
          <Clock theme={theme} hasWallpaper={!!activeWallpaper} />
        </div>

        {/* Desktop spacer to push content below the top Stats / Clock bar */}
        <div className="hidden lg:block h-28 shrink-0" />

        <main className="flex-1 flex flex-col items-center justify-start lg:justify-center w-full px-4 sm:px-5 lg:px-12 pt-0 pb-16 lg:pb-24">

          <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-12">
            <SearchSection
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              folders={folders}
              bookmarksCount={bookmarks.length}
              selectedEngineId={selectedEngineId}
              setSelectedEngineId={setSelectedEngineId}
              hasWallpaper={!!activeWallpaper}
              shortcuts={shortcuts}
              engines={engines}
              onAddShortcut={() => {
                setEditingShortcut(null);
                setIsShortcutModalOpen(true);
              }}
              onDeleteShortcut={deleteShortcut}
              onEditShortcut={(shortcut) => {
                setEditingShortcut(shortcut);
                setIsShortcutModalOpen(true);
              }}
            />

            {/* Bookmarks Section */}
            <div className="w-full space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg lg:text-xl font-bold text-text-primary">Bookmarks</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-orange/20 text-primary-orange text-xs font-semibold">
                    {bookmarks.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle: Row vs Card */}
                  <div className="flex items-center p-0.5 bg-bg-card/70 backdrop-blur-md rounded-xl border border-white/10 shadow-xs">
                    <button
                      onClick={() => setBookmarkView('row')}
                      className={`p-1.5 rounded-lg transition-all ${bookmarkView === 'row'
                        ? 'bg-primary-orange text-white shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                        }`}
                      title="Row View (List)"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setBookmarkView('card')}
                      className={`p-1.5 rounded-lg transition-all ${bookmarkView === 'card'
                        ? 'bg-primary-orange text-white shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                        }`}
                      title="Card View (Grid)"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Filter Toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-xl transition-all ${showFilters ? 'bg-primary-orange text-white shadow-orange' : 'bg-bg-card/70 backdrop-blur-md text-text-secondary hover:bg-bg-card shadow-sm border border-white/10'}`}
                    title={showFilters ? "Hide Filters" : "Show Filters"}
                  >
                    <Filter className="w-4 h-4" />
                  </button>

                  {/* Add Bookmark */}
                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-orange text-white text-sm font-semibold shadow-orange hover:shadow-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>

              {/* Filter Cards Grid */}
              {showFilters && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* All Card */}
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all border text-left shadow-xs ${activeFilter === 'all'
                      ? 'bg-primary-orange text-white border-primary-orange shadow-orange/30'
                      : 'bg-bg-card/80 hover:bg-bg-card backdrop-blur-md border-gray-200/60 dark:border-white/10 text-text-primary'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${activeFilter === 'all' ? 'bg-white/20' : 'bg-primary-orange/15 text-primary-orange'}`}>
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold truncate">All</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${activeFilter === 'all' ? 'bg-white/25 text-white' : 'bg-bg-input text-text-secondary'}`}>
                      {bookmarks.length}
                    </span>
                  </button>

                  {/* Starred Card */}
                  <button
                    onClick={() => setActiveFilter('starred')}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all border text-left shadow-xs ${activeFilter === 'starred'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-amber-500/30'
                      : 'bg-bg-card/80 hover:bg-bg-card backdrop-blur-md border-gray-200/60 dark:border-white/10 text-text-primary'
                      }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${activeFilter === 'starred' ? 'bg-white/20' : 'bg-amber-400/15 text-amber-500'}`}>
                        <Star className={`w-3.5 h-3.5 ${activeFilter === 'starred' ? 'fill-white' : 'fill-amber-400'}`} />
                      </div>
                      <span className="text-xs font-semibold truncate">Starred</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${activeFilter === 'starred' ? 'bg-white/25 text-white' : 'bg-bg-input text-text-secondary'}`}>
                      {starredBookmarks.length}
                    </span>
                  </button>

                  {/* Folder Cards */}
                  {folders.map((folder) => {
                    const count = bookmarks.filter((b) => (b.folder || 'Uncategorized') === folder).length;
                    const isActive = activeFilter === folder;

                    return (
                      <button
                        key={folder}
                        onClick={() => setActiveFilter(folder)}
                        className={`flex items-center justify-between p-3 rounded-2xl transition-all border text-left shadow-xs ${isActive
                          ? 'bg-primary-orange text-white border-primary-orange shadow-orange/30'
                          : 'bg-bg-card/80 hover:bg-bg-card backdrop-blur-md border-gray-200/60 dark:border-white/10 text-text-primary'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-white/20' : 'bg-bg-input text-primary-orange'}`}>
                            <Folder className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-semibold truncate">{folder}</span>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-bg-input text-text-secondary'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <BookmarkGrid
                bookmarks={bookmarks}
                groupedBookmarks={groupedBookmarks}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                viewMode={bookmarkView}
                onOpenDetails={handleOpenDetails}
                onToggleStar={toggleStarBookmark}
                onAdd={openAddModal}
                onImport={handleImport}
              />
            </div>

            {filteredBookmarks.length > 0 && (
              <RecentBookmarks recentBookmarks={filteredBookmarks.slice(0, 6)} />
            )}
          </div>
        </main>

        <BookmarkDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          bookmark={selectedBookmarkForDetails}
          availableFolders={[...new Set(bookmarks.map((b) => b.folder).filter(Boolean))]}
          onToggleStar={toggleStarBookmark}
          onEdit={openEditModal}
          onDelete={deleteBookmark}
          onUpdateFolder={handleUpdateFolder}
        />

        <BookmarkModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveBookmark}
          initialData={editingBookmark}
          availableFolders={[...new Set(bookmarks.map((b) => b.folder).filter(Boolean))]}
        />

        <ShortcutModal
          isOpen={isShortcutModalOpen}
          onClose={() => setIsShortcutModalOpen(false)}
          onSave={(data) => {
            if (editingShortcut) {
              updateShortcut(editingShortcut.id, data);
            } else {
              addShortcut(data);
            }
          }}
          initialData={editingShortcut}
        />

      </div>
    </div>
  );
}
