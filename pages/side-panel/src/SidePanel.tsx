import '@src/SidePanel.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { Search, RefreshCw, Download, ExternalLink, Bookmark, ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import type React from 'react';

interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
  dateAdded?: number;
}

const SidePanel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ total: 0, folders: 0 });

  // 加载书签
  const loadBookmarks = useCallback(async () => {
    const tree = await chrome.bookmarks.getTree();
    setBookmarks(tree);
    setFilteredBookmarks(tree);
    // 计算统计信息
    const calculateStats = (nodes: BookmarkNode[]): { total: number; folders: number } => {
      let total = 0;
      let folders = 0;
      for (const node of nodes) {
        if (node.url) {
          total++;
        } else if (node.children) {
          folders++;
          const childStats = calculateStats(node.children);
          total += childStats.total;
          folders += childStats.folders;
        }
      }
      return { total, folders };
    };
    setStats(calculateStats(tree));
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // 搜索书签
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBookmarks(bookmarks);
      return;
    }

    const searchBookmarks = (nodes: BookmarkNode[]): BookmarkNode[] => {
      const results: BookmarkNode[] = [];
      for (const node of nodes) {
        if (node.url) {
          if (
            node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.url.toLowerCase().includes(searchQuery.toLowerCase())
          ) {
            results.push(node);
          }
        }
        if (node.children) {
          const childResults = searchBookmarks(node.children);
          if (childResults.length > 0) {
            results.push({
              ...node,
              children: childResults,
            });
          }
        }
      }
      return results;
    };

    setFilteredBookmarks(searchBookmarks(bookmarks));
  }, [searchQuery, bookmarks]);

  // 切换文件夹展开/折叠
  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  // 展开所有文件夹
  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (nodes: BookmarkNode[]) => {
      for (const node of nodes) {
        if (node.children) {
          allIds.add(node.id);
          collectIds(node.children);
        }
      }
    };
    collectIds(bookmarks);
    setExpandedFolders(allIds);
  };

  // 折叠所有文件夹
  const collapseAll = () => {
    setExpandedFolders(new Set());
  };

  // 打开书签
  const openBookmark = (url: string) => {
    chrome.tabs.create({ url });
  };

  // 导出书签
  const exportBookmarks = () => {
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `bookmarks-export-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // 渲染书签树
  const renderBookmarkTree = (nodes: BookmarkNode[], level = 0): React.ReactNode[] =>
    nodes.map(node => {
      const isFolder = !!node.children;
      const isExpanded = expandedFolders.has(node.id);

      if (isFolder) {
        return (
          <div key={node.id} className="select-none">
            <button
              onClick={() => toggleFolder(node.id)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ paddingLeft: `${level * 12 + 8}px` }}>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-500" />
              )}
              <Folder className="h-4 w-4 flex-shrink-0 text-blue-500" />
              <span className="flex-1 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {node.title || '未命名文件夹'}
              </span>
            </button>
            {isExpanded && node.children && (
              <div className="mt-0.5">{renderBookmarkTree(node.children, level + 1)}</div>
            )}
          </div>
        );
      }

      if (node.url) {
        return (
          <button
            key={node.id}
            onClick={() => openBookmark(node.url!)}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ paddingLeft: `${level * 12 + 28}px` }}>
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            <span className="flex-1 truncate text-sm text-gray-700 dark:text-gray-300">{node.title || node.url}</span>
          </button>
        );
      }

      return null;
    });

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-gray-900">
      {/* 头部 */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Bookmark className="h-6 w-6 text-white" />
          <h1 className="text-xl font-bold text-white">书签管理器</h1>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">书签总数：</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.total}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">文件夹：</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.folders}</span>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索书签..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={expandAll}
            className="rounded bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
            全部展开
          </button>
          <button
            onClick={collapseAll}
            className="rounded bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
            全部折叠
          </button>
          <button
            onClick={loadBookmarks}
            className="flex items-center gap-1 rounded bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
            <RefreshCw className="h-3.5 w-3.5" />
            刷新
          </button>
          <button
            onClick={exportBookmarks}
            className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
            <Download className="h-3.5 w-3.5" />
            导出
          </button>
        </div>
      </div>

      {/* 书签树 */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filteredBookmarks.length === 0 && searchQuery && (
          <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Search className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>未找到匹配的书签</p>
            </div>
          </div>
        )}
        {filteredBookmarks.length > 0 && <div className="space-y-0.5">{renderBookmarkTree(filteredBookmarks)}</div>}
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
