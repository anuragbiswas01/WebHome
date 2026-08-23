import { useState } from "react";

export function useWallpaper() {
  const [wallpaper, setWallpaper] = useState(() => {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("wallpaper");
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configuration
  const CONFIG = {
    // 'local' or 'github'
    sourceType: "local",

    // For 'local': Place images in public/backgrounds/
    // Naming convention: bg-1.jpg, bg-2.jpg, ... or list filenames explicitly
    localPath: "/backgrounds",
    localFiles: [], // We will generate path dynamically
    localCount: 337, // Updated count

    // For 'github':
    githubOwner: "DenverCoder1",
    githubRepo: "minimal-wallpapers",
    githubPath: "images",
  };

  const getUrl = (filename) => `${CONFIG.localPath}/${filename}`;

  // Helper to check if an image is loadable
  const checkImageExists = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  const fetchNewWallpaper = async () => {
    setLoading(true);
    setError(null);
    try {
      let imageUrl;

      if (CONFIG.sourceType === "local") {
        // Try up to 3 times to find a valid image (in case of wrong extension guess)
        // Since we have mixed extensions and don't have a manifest, we'll try to guess.
        // A better way for production is to generate a 'manifest.json', but for now:

        let found = false;
        let attempts = 0;

        while (!found && attempts < 5) {
          const num = Math.floor(Math.random() * CONFIG.localCount) + 1;

          // Try jpg first, then png
          const jpgUrl = getUrl(`bg-${num}.jpg`);
          const pngUrl = getUrl(`bg-${num}.png`);

          if (await checkImageExists(jpgUrl)) {
            imageUrl = jpgUrl;
            found = true;
          } else if (await checkImageExists(pngUrl)) {
            imageUrl = pngUrl;
            found = true;
          }
          attempts++;
        }

        if (!found)
          throw new Error(
            "Could not find a valid local image after multiple attempts"
          );
      } else {
        // GitHub Fetch Logic
        const response = await fetch(
          `https://api.github.com/repos/${CONFIG.githubOwner}/${CONFIG.githubRepo}/contents/${CONFIG.githubPath}`
        );

        if (!response.ok) throw new Error("Failed to fetch wallpaper list");

        const data = await response.json();
        const images = data.filter(
          (file) =>
            file.type === "file" && /\.(jpg|jpeg|png|webp)$/i.test(file.name)
        );

        if (images.length === 0)
          throw new Error("No images found in repository");
        const randomImage = images[Math.floor(Math.random() * images.length)];
        imageUrl = randomImage.download_url;
      }

      setWallpaper(imageUrl);
      localStorage.setItem("wallpaper", imageUrl);
    } catch (err) {
      console.warn("Wallpaper fetch error:", err);
      // Fallback to a safe random image service if local/remote fails
      const fallback = `https://picsum.photos/1920/1080?random=${Date.now()}`;
      setWallpaper(fallback);
      localStorage.setItem("wallpaper", fallback);
    } finally {
      setLoading(false);
    }
  };

  const clearWallpaper = () => {
    setWallpaper(null);
    localStorage.removeItem("wallpaper");
  };

  return { wallpaper, fetchNewWallpaper, clearWallpaper, loading, error };
}
