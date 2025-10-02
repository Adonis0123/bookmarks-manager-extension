import { collectTopFolders } from '../utils/bookmarkFilters';
import { useState, useCallback, useRef } from 'react';
import type { BookmarkNode } from '../types/bookmark';

interface UseBookmarksReturn {
  bookmarks: BookmarkNode[];
  loading: boolean;
  expandedFolders: Set<string>;
  loadBookmarks: (preserveScroll?: boolean, skipLoading?: boolean) => Promise<void>;
  toggleFolder: (folderId: string) => void;
  expandAll: (selectedIds?: Set<string>) => void;
  collapseAll: (selectedIds?: Set<string>) => void;
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkNode[]>>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * 管理书签数据、加载状态和展开/折叠状态
 */
export const useBookmarks = (): UseBookmarksReturn => {
  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  const saveScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
  }, []);

  const restoreScrollPosition = useCallback(() => {
    if (scrollContainerRef.current && scrollPositionRef.current) {
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollPositionRef.current;
        }
      });
    }
  }, []);

  /**
   * 从 Chrome API 加载书签
   */
  const loadBookmarks = useCallback(
    async (preserveScroll = false, skipLoading = false) => {
      if (preserveScroll) {
        saveScrollPosition();
      }

      if (!skipLoading) {
        setLoading(true);
      }

      try {
        const tree = await chrome.bookmarks.getTree();
        const rootChildren = tree[0].children || [];
        setBookmarks(rootChildren);

        // 首次加载时展开前两级文件夹
        if (!skipLoading && expandedFolders.size === 0) {
          const initialExpanded = collectTopFolders(rootChildren, 2);
          setExpandedFolders(initialExpanded);
        }
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
      } finally {
        if (!skipLoading) {
          setLoading(false);
        }
        if (preserveScroll) {
          restoreScrollPosition();
        }
      }
    },
    [saveScrollPosition, restoreScrollPosition, expandedFolders.size],
  );

  /**
   * 切换文件夹展开/折叠状态
   */
  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  /**
   * 展开所有文件夹或选中的文件夹
   */
  const expandAll = useCallback(
    (selectedIds?: Set<string>) => {
      if (selectedIds && selectedIds.size > 0) {
        // 展开选中的文件夹
        const newExpanded = new Set(expandedFolders);
        selectedIds.forEach(id => {
          const findNode = (nodes: BookmarkNode[]): BookmarkNode | null => {
            for (const node of nodes) {
              if (node.id === id && node.children) return node;
              if (node.children) {
                const found = findNode(node.children);
                if (found) return found;
              }
            }
            return null;
          };
          const node = findNode(bookmarks);
          if (node) {
            newExpanded.add(id);
          }
        });
        setExpandedFolders(newExpanded);
      } else {
        // 展开所有文件夹
        const allFolderIds = new Set<string>();
        const collectFolderIds = (nodes: BookmarkNode[]) => {
          nodes.forEach(node => {
            if (node.children) {
              allFolderIds.add(node.id);
              collectFolderIds(node.children);
            }
          });
        };
        collectFolderIds(bookmarks);
        setExpandedFolders(allFolderIds);
      }
    },
    [bookmarks, expandedFolders],
  );

  /**
   * 折叠所有文件夹或选中的文件夹
   */
  const collapseAll = useCallback((selectedIds?: Set<string>) => {
    if (selectedIds && selectedIds.size > 0) {
      // 折叠选中的文件夹
      setExpandedFolders(prev => {
        const next = new Set(prev);
        selectedIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      // 折叠所有文件夹
      setExpandedFolders(new Set());
    }
  }, []);

  return {
    bookmarks,
    loading,
    expandedFolders,
    loadBookmarks,
    toggleFolder,
    expandAll,
    collapseAll,
    setBookmarks,
    scrollContainerRef,
  };
};
