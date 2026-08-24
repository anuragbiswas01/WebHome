import { useState, useEffect } from 'react';

const STORAGE_KEYS = {
  SHOW_CLOCK: 'webhome_show_clock',
  CLOCK_FORMAT: 'webhome_clock_format',
};

export function useClockSettings() {
  const [showClock, setShowClock] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.SHOW_CLOCK);
      return stored !== null ? JSON.parse(stored) : true;
    }
    return true;
  });

  const [clockFormat, setClockFormat] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.CLOCK_FORMAT);
      return stored || '12h';
    }
    return '12h';
  });

  const toggleShowClock = () => {
    setShowClock((prev) => {
      const next = !prev;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SHOW_CLOCK, JSON.stringify(next));
      }
      window.dispatchEvent(new Event('webhome_clock_settings_changed'));
      return next;
    });
  };

  const setFormat = (fmt) => {
    setClockFormat(fmt);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CLOCK_FORMAT, fmt);
    }
    window.dispatchEvent(new Event('webhome_clock_settings_changed'));
  };

  useEffect(() => {
    const handleStorage = () => {
      try {
        const storedShow = localStorage.getItem(STORAGE_KEYS.SHOW_CLOCK);
        if (storedShow !== null) setShowClock(JSON.parse(storedShow));
        const storedFmt = localStorage.getItem(STORAGE_KEYS.CLOCK_FORMAT);
        if (storedFmt) setClockFormat(storedFmt);
      } catch (e) {
        console.warn('Failed to parse clock settings:', e);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('webhome_clock_settings_changed', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('webhome_clock_settings_changed', handleStorage);
    };
  }, []);

  return {
    showClock,
    clockFormat,
    toggleShowClock,
    setFormat,
    setShowClock: (val) => {
      setShowClock(val);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SHOW_CLOCK, JSON.stringify(val));
      }
      window.dispatchEvent(new Event('webhome_clock_settings_changed'));
    },
  };
}
