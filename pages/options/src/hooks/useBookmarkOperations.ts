import { removeNodeFromTree, removeBatchNodesFromTree, getRootFolders } from '../utils/bookmarkTransform';
import { useCallback, startTransition } from 'react';
import type { BookmarkNode } from '../types/bookmark';

interface UseBookmarkOperationsProps {
  bookmarks: BookmarkNode[];
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkNode[]>>;
  loadBookmarks: (preserveScroll?: boolean, skipLoading?: boolean) => Promise<void>;
}

interface UseBookmarkOperationsReturn {
  deleteBookmark: (id: string) => Promise<void>;
  deleteSelectedBookmarks: (selectedIds: Set<string>) => Promise<void>;
  moveBookmark: (bookmarkId: string, newParentId: string, newIndex: number) => Promise<void>;
  exportBookmarks: () => void;
}

/**
 * 管理书签的增删改查操作
 */
export const useBookmarkOperations = ({
  bookmarks,
  setBookmarks,
  loadBookmarks,
}: UseBookmarkOperationsProps): UseBookmarkOperationsReturn => {
  /**
   * 删除单个书签或文件夹
   */
  const deleteBookmark = useCallback(
    async (id: string) => {
      try {
        const [bookmark] = await chrome.bookmarks.get(id);

        // 检查是否为根文件夹
        if (bookmark.parentId === '0') {
          alert('无法删除根书签文件夹');
          return;
        }

        // 确认删除
        const isFolder = !bookmark.url;
        const message = isFolder
          ? `确定要删除文件夹 "${bookmark.title}" 及其所有内容吗？`
          : `确定要删除书签 "${bookmark.title}" 吗？`;

        if (!confirm(message)) {
          return;
        }

        // 先在本地更新状态
        setBookmarks(prev => removeNodeFromTree(prev, id));

        // 执行删除
        if (isFolder) {
          await chrome.bookmarks.removeTree(id);
        } else {
          await chrome.bookmarks.remove(id);
        }

        // 静默更新数据
        await loadBookmarks(true, true);
      } catch (error) {
        console.error('Failed to delete bookmark:', error);
        alert('删除失败：' + (error as Error).message);
        // 失败时重新加载
        await loadBookmarks(true, true);
      }
    },
    [setBookmarks, loadBookmarks],
  );

  /**
   * 批量删除选中的书签
   */
  const deleteSelectedBookmarks = useCallback(
    async (selectedIds: Set<string>) => {
      if (selectedIds.size === 0) return;

      try {
        // 检查是否包含根文件夹
        const rootFolders = await getRootFolders(Array.from(selectedIds));
        const bookmarksToDelete = Array.from(selectedIds).filter(id => !rootFolders.find(rf => rf.id === id));

        if (rootFolders.length > 0) {
          const rootTitles = rootFolders.map(rf => rf.title).join(', ');
          alert(`以下根文件夹无法删除：\n${rootTitles}\n\n将只删除其他 ${bookmarksToDelete.length} 个书签`);
          if (bookmarksToDelete.length === 0) {
            return;
          }
        }

        if (!confirm(`确定要删除 ${bookmarksToDelete.length} 个选中的书签吗？`)) {
          return;
        }

        // 先在本地批量更新状态
        setBookmarks(prev => removeBatchNodesFromTree(prev, bookmarksToDelete));

        // 执行批量删除
        for (const id of bookmarksToDelete) {
          try {
            await chrome.bookmarks.removeTree(id);
          } catch {
            // 如果是书签而不是文件夹，尝试使用 remove
            try {
              await chrome.bookmarks.remove(id);
            } catch (innerError) {
              console.error(`Failed to delete bookmark ${id}:`, innerError);
            }
          }
        }

        // 静默更新数据
        await loadBookmarks(true, true);
      } catch (error) {
        console.error('Failed to delete selected bookmarks:', error);
        alert('删除失败：' + (error as Error).message);
        await loadBookmarks(true, true);
      }
    },
    [setBookmarks, loadBookmarks],
  );

  /**
   * 移动书签或文件夹
   */
  const moveBookmark = useCallback(
    async (bookmarkId: string, newParentId: string, newIndex: number) => {
      try {
        // 移动书签
        await chrome.bookmarks.move(bookmarkId, {
          parentId: newParentId,
          index: newIndex,
        });

        // 使用 startTransition 避免阻塞 UI
        const tree = await chrome.bookmarks.getTree();
        startTransition(() => {
          setBookmarks(tree[0].children || []);
        });
      } catch (error) {
        console.error('Failed to move bookmark:', error);
        alert('移动失败：' + (error as Error).message);
        await loadBookmarks(true, true);
      }
    },
    [setBookmarks, loadBookmarks],
  );

  /**
   * 导出书签为 JSON
   */
  const exportBookmarks = useCallback(() => {
    const exportData = JSON.stringify(bookmarks, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [bookmarks]);

  return {
    deleteBookmark,
    deleteSelectedBookmarks,
    moveBookmark,
    exportBookmarks,
  };
};
