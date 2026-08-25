import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Clock as ClockIcon } from 'lucide-react';
import { useClockSettings } from '../../hooks/useClockSettings';

export const Route = createFileRoute('/settings/clock')({
  component: ClockSettingsPage,
});

function ClockSettingsPage() {
  const { showClock, toggleShowClock, clockFormat, setClockFormat } = useClockSettings();

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
          <h1 className="text-2xl font-bold drop-shadow-sm">Clock & Header</h1>
        </div>
      </div>

      <div className="space-y-4 pb-12">
        <div className="bg-bg-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary-orange font-medium text-sm uppercase tracking-wider">
            <ClockIcon className="w-4 h-4" />
            Clock Display
          </div>

          {/* Toggle Show/Hide Clock */}
          <div className="flex items-center justify-between">
            <span className="text-text-primary font-medium text-sm">Show Clock</span>
            <button
              onClick={toggleShowClock}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showClock ? 'bg-primary-orange' : 'bg-bg-input'
              }`}
              title={showClock ? 'Hide Clock' : 'Show Clock'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showClock ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Clock Format Selection */}
          {showClock && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-text-primary font-medium text-sm">Time Format</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setClockFormat('12h')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    clockFormat === '12h'
                      ? 'bg-primary-orange text-white'
                      : 'bg-bg-input text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  12-Hour (AM/PM)
                </button>
                <button
                  onClick={() => setClockFormat('24h')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    clockFormat === '24h'
                      ? 'bg-primary-orange text-white'
                      : 'bg-bg-input text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  24-Hour
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
