import { useMemo } from 'react';
import type { BookmarkNode, DuplicateBookmark } from '../types/bookmark';

/**
 * 检测并管理重复书签
 */
export const useDuplicates = (bookmarks: BookmarkNode[]) => {
  const { duplicates, duplicateUrls, duplicateCount } = useMemo(() => {
    const urlMap = new Map<string, BookmarkNode[]>();

    const collectBookmarks = (nodes: BookmarkNode[]) => {
      for (const node of nodes) {
        if (node.url) {
          const existing = urlMap.get(node.url) || [];
          existing.push(node);
          urlMap.set(node.url, existing);
        }
        if (node.children) {
          collectBookmarks(node.children);
        }
      }
    };

    collectBookmarks(bookmarks);

    const duplicateList: DuplicateBookmark[] = [];
    const urls = new Set<string>();
    let count = 0;

    urlMap.forEach((bookmarkList, url) => {
      if (bookmarkList.length > 1) {
        duplicateList.push({ url, bookmarks: bookmarkList });
        urls.add(url);
        count += bookmarkList.length - 1;
      }
    });

    return {
      duplicates: duplicateList,
      duplicateUrls: urls,
      duplicateCount: count,
    };
  }, [bookmarks]);

  /**
   * 删除所有重复书签（保留每个 URL 的第一个）
   */
  const removeDuplicates = async () => {
    if (duplicates.length === 0) return;

    if (!confirm(`确定要删除 ${duplicateCount} 个重复的书签吗？`)) {
      return false;
    }

    try {
      for (const dup of duplicates) {
        // 跳过第一个，删除其余的
        for (let i = 1; i < dup.bookmarks.length; i++) {
          await chrome.bookmarks.remove(dup.bookmarks[i].id);
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to remove duplicates:', error);
      return false;
    }
  };

  return {
    duplicates,
    duplicateUrls,
    duplicateCount,
    removeDuplicates,
  };
};
