import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Sun, Moon, Palette, Check } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const Route = createFileRoute('/settings/appearance')({
  component: AppearanceSettingsPage,
});

function AppearanceSettingsPage() {
  const { theme, toggleTheme, primaryColor, setPrimaryColor, PRESET_ACCENT_COLORS } = useTheme();

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 text-text-primary">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/settings"
          className="p-2 rounded-full bg-bg-card/50 hover:bg-bg-input/80 backdrop-blur-sm transition-colors group shadow-sm"
        >
          <ArrowLeft className="w-6 h-6 text-text-primary group-hover:text-primary-orange" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold drop-shadow-sm">Appearance</h1>
        </div>
      </div>

      <div className="space-y-4 pb-12">
        <div className="bg-bg-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-accent-purple font-medium text-sm uppercase tracking-wider">
            <Sun className="w-4 h-4" />
            Theme & Style
          </div>

          {/* Theme Mode */}
          <div className="flex items-center justify-between">
            <span className="text-text-primary font-medium text-sm">Theme Mode</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-input hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Accent Color */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-medium text-sm">Primary Color</span>
              <span className="text-xs font-mono text-text-muted">{primaryColor?.toUpperCase()}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {PRESET_ACCENT_COLORS.map((preset) => {
                const isSelected = primaryColor?.toLowerCase() === preset.color.toLowerCase();
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setPrimaryColor(preset.color)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-xs relative"
                    style={{ backgroundColor: preset.color }}
                    title={preset.name}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                  </button>
                );
              })}

              {/* Custom Color Input */}
              <label
                className="w-8 h-8 rounded-full bg-bg-input hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-xs relative"
                title="Pick Custom Color"
              >
                <Palette className="w-4 h-4 text-text-secondary" />
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
