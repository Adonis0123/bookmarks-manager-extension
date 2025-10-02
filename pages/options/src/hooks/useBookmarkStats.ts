import { useMemo } from 'react';
import type { BookmarkNode, BookmarkStats } from '../types/bookmark';

/**
 * 计算书签统计信息
 */
export const useBookmarkStats = (bookmarks: BookmarkNode[]): BookmarkStats =>
  useMemo(() => {
    let totalCount = 0;
    let folderCount = 0;

    const countNodes = (nodes: BookmarkNode[]) => {
      for (const node of nodes) {
        if (node.children) {
          folderCount++;
          countNodes(node.children);
        } else {
          totalCount++;
        }
      }
    };

    countNodes(bookmarks);

    return {
      totalCount,
      folderCount,
      duplicateCount: 0, // 由 useDuplicates hook 提供
    };
  }, [bookmarks]);
