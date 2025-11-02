import { buildBookmarkMap, getBookmarkPath } from '../utils/bookmarkPath';
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

    // 构建书签映射用于获取路径
    const bookmarkMap = buildBookmarkMap(bookmarks);

    const duplicateList: DuplicateBookmark[] = [];
    const urls = new Set<string>();
    let count = 0;

    urlMap.forEach((bookmarkList, url) => {
      if (bookmarkList.length > 1) {
        // 将书签列表转换为包含路径信息的格式
        const items = bookmarkList.map((bookmark, index) => ({
          bookmark,
          path: getBookmarkPath(bookmark.id, bookmarkMap),
          isKeep: index === 0, // 默认保留第一个
        }));

        duplicateList.push({
          url,
          title: bookmarkList[0].title || '未命名',
          items,
        });
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
   * 删除标记为删除的重复书签
   * @param duplicatesToRemove 包含删除标记的重复书签列表
   */
  const removeDuplicates = async (duplicatesToRemove: DuplicateBookmark[]) => {
    if (duplicatesToRemove.length === 0) return false;

    try {
      for (const dup of duplicatesToRemove) {
        // 删除标记为不保留的书签
        for (const item of dup.items) {
          if (!item.isKeep) {
            await chrome.bookmarks.remove(item.bookmark.id);
          }
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
