import { useContext } from "react";
import { BookmarksContext } from "../contexts/bookmarksContextDef";
export { parseBookmarkHTML, generateBookmarkHTML, mergeBookmarkLists } from "../utils/bookmarkUtils";

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarksProvider");
  }
  return context;
}
