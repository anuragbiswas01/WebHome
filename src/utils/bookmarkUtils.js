// Helper to deduplicate and merge bookmark lists
export function mergeBookmarkLists(localList = [], remoteList = []) {
  const mergedMap = new Map();

  // First insert all remote items
  remoteList.forEach((item) => {
    if (item && item.url) {
      const key = `${item.url.trim().toLowerCase()}|${(item.folder || "").trim().toLowerCase()}`;
      mergedMap.set(key, { ...item });
    }
  });

  // Then merge or overwrite with local items if newer
  localList.forEach((item) => {
    if (item && item.url) {
      const key = `${item.url.trim().toLowerCase()}|${(item.folder || "").trim().toLowerCase()}`;
      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key);
        const localDate = Number(item.addDate) || 0;
        const remoteDate = Number(existing.addDate) || 0;
        if (localDate >= remoteDate) {
          mergedMap.set(key, { ...existing, ...item });
        }
      } else {
        mergedMap.set(key, { ...item });
      }
    }
  });

  return Array.from(mergedMap.values());
}

// Helper to parse Netscape Bookmark HTML
export const parseBookmarkHTML = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const links = doc.querySelectorAll("a");
  const parsed = [];

  links.forEach((link, index) => {
    const folder =
      link.closest("dl")?.previousElementSibling?.textContent || "Imported";
    parsed.push({
      id: Date.now() + index,
      title: link.textContent || "Untitled",
      url: link.getAttribute("href") || "",
      folder: folder.trim(),
      addDate: parseInt(link.getAttribute("add_date") || String(Date.now()), 10),
      icon: link.getAttribute("icon") || "",
    });
  });

  return parsed;
};

// Helper to generate Netscape Bookmark HTML
export const generateBookmarkHTML = (
  bookmarks,
  shortcuts = [],
  searchEngines = []
) => {
  const folders = [...new Set(bookmarks.map((b) => b.folder || "Bookmarks"))];

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>\n`;

  // Shortcuts Folder
  if (shortcuts.length > 0) {
    html += `    <DT><H3>Shortcuts</H3>\n    <DL><p>\n`;
    shortcuts.forEach((bookmark) => {
      html += `        <DT><A HREF="${bookmark.url}" ADD_DATE="${bookmark.addDate}"${bookmark.icon ? ` ICON="${bookmark.icon}"` : ""}>${bookmark.title}</A>\n`;
    });
    html += `    </DL><p>\n`;
  }

  // Search Engines Folder
  if (searchEngines.length > 0) {
    html += `    <DT><H3>Search Engines</H3>\n    <DL><p>\n`;
    searchEngines.forEach((engine) => {
      html += `        <DT><A HREF="${engine.url}" ADD_DATE="${Date.now()}">${engine.name}</A>\n`;
    });
    html += `    </DL><p>\n`;
  }

  // Regular Folders
  folders.forEach((folder) => {
    html += `    <DT><H3>${folder}</H3>\n    <DL><p>\n`;
    bookmarks
      .filter((b) => (b.folder || "Bookmarks") === folder)
      .forEach((bookmark) => {
        html += `        <DT><A HREF="${bookmark.url}" ADD_DATE="${bookmark.addDate}"${bookmark.icon ? ` ICON="${bookmark.icon}"` : ""}>${bookmark.title}</A>\n`;
      });
    html += `    </DL><p>\n`;
  });

  html += `</DL><p>`;
  return html;
};
