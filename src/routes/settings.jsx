import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useWallpaper } from '../hooks/useWallpaper';

export const Route = createFileRoute('/settings')({
  component: SettingsLayout,
});

function SettingsLayout() {
  const { wallpaper } = useWallpaper();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Fixed Hardware-Accelerated Background Layer (Zero Scroll Jitter) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat transition-all duration-500 ease-in-out"
        style={{
          backgroundImage: wallpaper ? `url(${wallpaper})` : undefined,
          backgroundColor: !wallpaper ? 'var(--color-bg-solid)' : undefined,
        }}
      >
        {wallpaper && <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />}
      </div>

      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  );
}
