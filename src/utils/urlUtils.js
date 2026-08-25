// Helper to format clean domain and auto-extract title from URL
export function extractDomain(url) {
  try {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    const parsed = new URL(cleanUrl);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function autoGenerateTitleFromUrl(url) {
  const domain = extractDomain(url);
  if (!domain) return '';
  const parts = domain.split('.');
  if (parts.length > 0) {
    const mainName = parts[0];
    return mainName.charAt(0).toUpperCase() + mainName.slice(1);
  }
  return domain;
}

export function getHighResFaviconUrl(url) {
  const domain = extractDomain(url);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
