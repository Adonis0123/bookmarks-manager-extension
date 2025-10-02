import { useBookmarkOperations } from '../../hooks/useBookmarkOperations';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useBookmarkStats } from '../../hooks/useBookmarkStats';
import { useDuplicates } from '../../hooks/useDuplicates';
import { filterBookmarks } from '../../utils/bookmarkFilters';
import { BatchOperationBar } from '../BatchOperationBar';
import { BookmarkTree } from '../BookmarkTree';
import { SearchBar } from '../SearchBar';
import { StatsCards } from '../StatsCards';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import type React from 'react';

/**
 * 书签管理器主容器组件
 * 使用 React Complex Tree 提供完整的书签管理功能
 */
export const BookmarkManager: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Hooks
  const {
    bookmarks,
    loading,
    expandedFolders,
    loadBookmarks,
    toggleFolder,
    expandAll,
    collapseAll,
    setBookmarks,
    scrollContainerRef,
  } = useBookmarks();

  const { deleteBookmark, deleteSelectedBookmarks, moveBookmark, exportBookmarks } = useBookmarkOperations({
    bookmarks,
    setBookmarks,
    loadBookmarks,
  });

  const stats = useBookmarkStats(bookmarks);
  const { duplicates, duplicateUrls, duplicateCount, removeDuplicates } = useDuplicates(bookmarks);

  // 初始加载
  useEffect(() => {
    loadBookmarks(false, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 过滤书签
  const filteredBookmarks = useMemo(() => filterBookmarks(bookmarks, searchQuery), [bookmarks, searchQuery]);

  // 选择处理
  const handleSelect = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleSelectAll = () => {
    if (selectedIds.size > 0) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set<string>();
      const collectIds = (nodes: typeof bookmarks) => {
        nodes.forEach(node => {
          allIds.add(node.id);
          if (node.children) {
            collectIds(node.children);
          }
        });
      };
      collectIds(filteredBookmarks);
      setSelectedIds(allIds);
    }
  };

  const handleDeleteSelected = async () => {
    await deleteSelectedBookmarks(selectedIds);
    setSelectedIds(new Set());
  };

  const handleRemoveDuplicates = async () => {
    const success = await removeDuplicates();
    if (success) {
      await loadBookmarks(true, true);
    }
  };

  const handleExpandAll = () => {
    expandAll(selectedIds.size > 0 ? selectedIds : undefined);
  };

  const handleCollapseAll = () => {
    collapseAll(selectedIds.size > 0 ? selectedIds : undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4">
      <div className="mb-6">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">书签管理器</h1>

        <StatsCards stats={{ ...stats, duplicateCount }} selectedCount={selectedIds.size} />

        <BatchOperationBar
          selectedCount={selectedIds.size}
          totalCount={stats.totalCount}
          duplicateCount={duplicateCount}
          onSelectAll={handleSelectAll}
          onDeleteSelected={handleDeleteSelected}
          onRemoveDuplicates={handleRemoveDuplicates}
          onExpandAll={handleExpandAll}
          onCollapseAll={handleCollapseAll}
          hasSelection={selectedIds.size > 0}
          hasDuplicates={duplicates.length > 0}
        />

        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={() => loadBookmarks()}
          onExport={exportBookmarks}
        />
      </div>

      {duplicates.length > 0 && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-gray-900 dark:text-gray-100">
              发现 {duplicateCount} 个重复书签，你可以点击"去重"按钮清理它们
            </span>
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="max-h-[600px] overflow-y-auto rounded-lg border p-4 dark:border-gray-700 dark:bg-gray-800">
        {filteredBookmarks.length > 0 ? (
          <BookmarkTree
            bookmarks={filteredBookmarks}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            expandedFolders={expandedFolders}
            onToggleFolder={toggleFolder}
            duplicateUrls={duplicateUrls}
            onDelete={deleteBookmark}
            onMove={moveBookmark}
          />
        ) : (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            {searchQuery ? '没有找到匹配的书签' : '暂无书签'}
          </div>
        )}
      </div>
    </div>
  );
};
