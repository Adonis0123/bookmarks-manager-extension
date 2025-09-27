import { BookmarkFolder } from './BookmarkFolder';
import { BookmarkItem } from './BookmarkItem';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@extension/ui';
import { Search, Trash2, RefreshCw, Copy, Download, AlertCircle } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import type { BookmarkNode, DuplicateBookmark, BookmarkStats } from '../types/bookmark';
import type { DragEndEvent } from '@dnd-kit/core';
import type React from 'react';

export const BookmarkManager: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [duplicates, setDuplicates] = useState<DuplicateBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BookmarkStats>({
    totalCount: 0,
    folderCount: 0,
    duplicateCount: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    loadBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const tree = await chrome.bookmarks.getTree();
      setBookmarks(tree[0].children || []);
      calculateStats(tree[0].children || []);
      findDuplicates(tree[0].children || []);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (nodes: BookmarkNode[]) => {
    let totalCount = 0;
    let folderCount = 0;

    const countNodes = (nodeList: BookmarkNode[]) => {
      for (const node of nodeList) {
        if (node.children) {
          folderCount++;
          countNodes(node.children);
        } else {
          totalCount++;
        }
      }
    };

    countNodes(nodes);
    setStats(prev => ({ ...prev, totalCount, folderCount }));
  };

  const findDuplicates = (nodes: BookmarkNode[]) => {
    const urlMap = new Map<string, BookmarkNode[]>();

    const collectBookmarks = (nodeList: BookmarkNode[]) => {
      for (const node of nodeList) {
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

    collectBookmarks(nodes);

    const duplicateList: DuplicateBookmark[] = [];
    let duplicateCount = 0;

    urlMap.forEach((bookmarkList, url) => {
      if (bookmarkList.length > 1) {
        duplicateList.push({ url, bookmarks: bookmarkList });
        duplicateCount += bookmarkList.length - 1;
      }
    });

    setDuplicates(duplicateList);
    setStats(prev => ({ ...prev, duplicateCount }));
  };

  const duplicateUrls = useMemo(() => {
    const urls = new Set<string>();
    duplicates.forEach(dup => urls.add(dup.url));
    return urls;
  }, [duplicates]);

  const handleDelete = async (id: string) => {
    // 检查是否为根文件夹（根文件夹的 parentId 通常是 "0"）
    try {
      const [bookmark] = await chrome.bookmarks.get(id);
      if (bookmark.parentId === '0') {
        alert('无法删除根书签文件夹');
        return;
      }
      await chrome.bookmarks.removeTree(id);
      await loadBookmarks();
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      alert('删除失败：' + (error as Error).message);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    // 检查选中的书签中是否有根文件夹
    const bookmarksToDelete: string[] = [];
    const rootFolders: string[] = [];

    for (const id of selectedIds) {
      try {
        const [bookmark] = await chrome.bookmarks.get(id);
        if (bookmark.parentId === '0') {
          rootFolders.push(bookmark.title);
        } else {
          bookmarksToDelete.push(id);
        }
      } catch (error) {
        console.error(`Failed to get bookmark ${id}:`, error);
      }
    }

    if (rootFolders.length > 0) {
      alert(`以下根文件夹无法删除：\n${rootFolders.join(', ')}\n\n将只删除其他 ${bookmarksToDelete.length} 个书签`);
      if (bookmarksToDelete.length === 0) {
        return;
      }
    }

    if (!confirm(`确定要删除 ${bookmarksToDelete.length} 个选中的书签吗？`)) {
      return;
    }

    try {
      for (const id of bookmarksToDelete) {
        await chrome.bookmarks.removeTree(id);
      }
      await loadBookmarks();
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to delete selected bookmarks:', error);
      alert('删除失败：' + (error as Error).message);
    }
  };

  const handleRemoveDuplicates = async () => {
    if (duplicates.length === 0) return;

    if (!confirm(`确定要删除 ${stats.duplicateCount} 个重复的书签吗？`)) {
      return;
    }

    try {
      for (const dup of duplicates) {
        for (let i = 1; i < dup.bookmarks.length; i++) {
          await chrome.bookmarks.remove(dup.bookmarks[i].id);
        }
      }
      await loadBookmarks();
    } catch (error) {
      console.error('Failed to remove duplicates:', error);
    }
  };

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
    const allIds = new Set<string>();
    const collectIds = (nodes: BookmarkNode[]) => {
      nodes.forEach(node => {
        allIds.add(node.id);
        if (node.children) {
          collectIds(node.children);
        }
      });
    };
    collectIds(filteredBookmarks);

    if (selectedIds.size === allIds.size) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(allIds);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      try {
        await chrome.bookmarks.move(active.id as string, {
          parentId: over?.id as string,
          index: 0,
        });
        await loadBookmarks();
      } catch (error) {
        console.error('Failed to move bookmark:', error);
      }
    }
  };

  const handleExport = () => {
    const exportData = JSON.stringify(bookmarks, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterBookmarks = (nodes: BookmarkNode[], query: string): BookmarkNode[] => {
    if (!query) return nodes;

    return nodes.reduce((acc: BookmarkNode[], node) => {
      const matchesQuery =
        node.title?.toLowerCase().includes(query.toLowerCase()) ||
        node.url?.toLowerCase().includes(query.toLowerCase());

      if (node.children) {
        const filteredChildren = filterBookmarks(node.children, query);
        if (filteredChildren.length > 0 || matchesQuery) {
          acc.push({
            ...node,
            children: filteredChildren,
          });
        }
      } else if (matchesQuery) {
        acc.push(node);
      }

      return acc;
    }, []);
  };

  const filteredBookmarks = useMemo(
    () => filterBookmarks(bookmarks, searchQuery),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookmarks, searchQuery],
  );

  const renderBookmarks = (nodes: BookmarkNode[]) =>
    nodes.map(node => {
      if (node.children) {
        return (
          <BookmarkFolder
            key={node.id}
            folder={node}
            onDelete={handleDelete}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            duplicateUrls={duplicateUrls}
          />
        );
      }

      return (
        <BookmarkItem
          key={node.id}
          bookmark={node}
          onDelete={handleDelete}
          isSelected={selectedIds.has(node.id)}
          onSelect={handleSelect}
          isDuplicate={node.url ? duplicateUrls.has(node.url) : false}
        />
      );
    });

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
        <h1 className="mb-4 text-2xl font-bold">书签管理器</h1>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="text-sm text-gray-600 dark:text-gray-400">总书签数</div>
            <div className="text-2xl font-bold">{stats.totalCount}</div>
          </div>
          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <div className="text-sm text-gray-600 dark:text-gray-400">文件夹数</div>
            <div className="text-2xl font-bold">{stats.folderCount}</div>
          </div>
          <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <div className="text-sm text-gray-600 dark:text-gray-400">重复书签</div>
            <div className="text-2xl font-bold">{stats.duplicateCount}</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
            <div className="text-sm text-gray-600 dark:text-gray-400">已选中</div>
            <div className="text-2xl font-bold">{selectedIds.size}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="搜索书签..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-4 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
              {selectedIds.size > 0 ? '取消全选' : '全选'}
            </button>

            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2',
                selectedIds.size > 0
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700',
              )}>
              <Trash2 className="h-4 w-4" />
              删除选中
            </button>

            <button
              onClick={handleRemoveDuplicates}
              disabled={duplicates.length === 0}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2',
                duplicates.length > 0
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700',
              )}>
              <Copy className="h-4 w-4" />
              去重
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              <Download className="h-4 w-4" />
              导出
            </button>

            <button
              onClick={loadBookmarks}
              className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {duplicates.length > 0 && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm">发现 {stats.duplicateCount} 个重复书签，你可以点击"去重"按钮清理它们</span>
          </div>
        </div>
      )}

      <div className="max-h-[600px] overflow-y-auto rounded-lg border p-4 dark:border-gray-700">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredBookmarks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">{renderBookmarks(filteredBookmarks)}</div>
          </SortableContext>
        </DndContext>

        {filteredBookmarks.length === 0 && (
          <div className="py-8 text-center text-gray-500">{searchQuery ? '没有找到匹配的书签' : '暂无书签'}</div>
        )}
      </div>
    </div>
  );
};
