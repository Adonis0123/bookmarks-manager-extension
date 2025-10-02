import { removeNodeFromTree, removeBatchNodesFromTree, getRootFolders } from '../utils/bookmarkTransform';
import { useCallback, startTransition } from 'react';
import type { BookmarkNode } from '../types/bookmark';

interface UseBookmarkOperationsProps {
  bookmarks: BookmarkNode[];
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkNode[]>>;
  loadBookmarks: (preserveScroll?: boolean, skipLoading?: boolean) => Promise<void>;
  onRecordDelete?: (node: BookmarkNode, parentId: string, index: number) => void;
  onRecordMove?: (nodeId: string, oldParentId: string, oldIndex: number, newParentId: string, newIndex: number) => void;
  onRecordUpdate?: (nodeId: string, oldTitle: string, newTitle: string) => void;
}

interface UseBookmarkOperationsReturn {
  deleteBookmark: (id: string) => Promise<void>;
  deleteSelectedBookmarks: (selectedIds: Set<string>) => Promise<void>;
  moveBookmark: (bookmarkId: string, newParentId: string, newIndex: number) => Promise<void>;
  updateBookmark: (id: string, newTitle: string) => Promise<void>;
  createFolder: (parentId: string, title: string) => Promise<void>;
  exportBookmarks: () => void;
}

/**
 * 管理书签的增删改查操作
 */
export const useBookmarkOperations = ({
  bookmarks,
  setBookmarks,
  loadBookmarks,
  onRecordDelete,
  onRecordMove,
  onRecordUpdate,
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

        // 获取完整的节点信息（包括子节点）用于历史记录
        let fullNode: BookmarkNode = bookmark as BookmarkNode;
        if (isFolder) {
          const [subtree] = await chrome.bookmarks.getSubTree(id);
          fullNode = subtree as BookmarkNode;
        }

        // 记录到历史
        if (onRecordDelete && bookmark.parentId && bookmark.index !== undefined) {
          onRecordDelete(fullNode, bookmark.parentId, bookmark.index);
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
    [setBookmarks, loadBookmarks, onRecordDelete],
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
        // 获取移动前的位置信息
        const [bookmark] = await chrome.bookmarks.get(bookmarkId);
        const oldParentId = bookmark.parentId || '0';
        const oldIndex = bookmark.index || 0;

        // 记录到历史
        if (onRecordMove) {
          onRecordMove(bookmarkId, oldParentId, oldIndex, newParentId, newIndex);
        }

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
    [setBookmarks, loadBookmarks, onRecordMove],
  );

  /**
   * 更新书签或文件夹标题
   */
  const updateBookmark = useCallback(
    async (id: string, newTitle: string) => {
      try {
        // 获取旧标题用于历史记录
        const [bookmark] = await chrome.bookmarks.get(id);
        const oldTitle = bookmark.title;

        // 记录到历史
        if (onRecordUpdate && oldTitle !== newTitle) {
          onRecordUpdate(id, oldTitle, newTitle);
        }

        // 更新书签标题
        await chrome.bookmarks.update(id, {
          title: newTitle,
        });

        // 使用 startTransition 避免阻塞 UI
        const tree = await chrome.bookmarks.getTree();
        startTransition(() => {
          setBookmarks(tree[0].children || []);
        });
      } catch (error) {
        console.error('Failed to update bookmark:', error);
        alert('更新失败：' + (error as Error).message);
        await loadBookmarks(true, true);
      }
    },
    [setBookmarks, loadBookmarks, onRecordUpdate],
  );

  /**
   * 创建新文件夹
   */
  const createFolder = useCallback(
    async (parentId: string, title: string) => {
      try {
        // 创建文件夹
        await chrome.bookmarks.create({
          parentId: parentId,
          title: title,
        });

        // 使用 startTransition 避免阻塞 UI
        const tree = await chrome.bookmarks.getTree();
        startTransition(() => {
          setBookmarks(tree[0].children || []);
        });
      } catch (error) {
        console.error('Failed to create folder:', error);
        alert('创建文件夹失败：' + (error as Error).message);
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
    updateBookmark,
    createFolder,
    exportBookmarks,
  };
};
