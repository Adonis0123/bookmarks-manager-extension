import '@src/Popup.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { Search, Settings, ExternalLink, Bookmark } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
}

const Popup = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<BookmarkNode[]>([]);
  const [searchResults, setSearchResults] = useState<BookmarkNode[]>([]);
  const [currentTab, setCurrentTab] = useState<{ title: string; url: string } | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // 加载书签
  const loadBookmarks = useCallback(async () => {
    const tree = await chrome.bookmarks.getTree();
    setBookmarks(tree);
  }, []);

  // 获取当前标签页信息
  const getCurrentTab = useCallback(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.title && tab.url) {
      setCurrentTab({ title: tab.title, url: tab.url });
      // 检查当前页面是否已被收藏
      const results = await chrome.bookmarks.search({ url: tab.url });
      setIsBookmarked(results.length > 0);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
    getCurrentTab();
  }, [loadBookmarks, getCurrentTab]);

  // 搜索书签
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSelectedIndex(-1);
      return;
    }

    const searchBookmarks = (nodes: BookmarkNode[], results: BookmarkNode[] = []): BookmarkNode[] => {
      for (const node of nodes) {
        if (
          node.url &&
          (node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.url.toLowerCase().includes(searchQuery.toLowerCase()))
        ) {
          results.push(node);
        }
        if (node.children) {
          searchBookmarks(node.children, results);
        }
      }
      return results;
    };

    const results = searchBookmarks(bookmarks).slice(0, 8); // 只显示前8个结果
    setSearchResults(results);
    setSelectedIndex(-1); // 重置选中索引
  }, [searchQuery, bookmarks]);

  // 添加书签
  const handleAddBookmark = async () => {
    if (!currentTab) return;

    try {
      await chrome.bookmarks.create({
        title: currentTab.title,
        url: currentTab.url,
      });
      setIsBookmarked(true);
      // 重新加载书签
      await loadBookmarks();
    } catch (error) {
      console.error('添加书签失败:', error);
    }
  };

  // 打开书签
  const handleOpenBookmark = (url: string) => {
    chrome.tabs.create({ url });
  };

  // 打开完整管理页面
  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (searchResults.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && searchResults[selectedIndex]?.url) {
            handleOpenBookmark(searchResults[selectedIndex].url!);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchResults, selectedIndex]);

  return (
    <div className="flex h-[500px] w-full flex-col bg-white dark:bg-gray-900">
      {/* 头部 */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-white" />
            <h1 className="text-base font-semibold text-white">书签管理</h1>
          </div>
          <button
            onClick={openOptionsPage}
            className="rounded-md p-1.5 text-white transition-colors hover:bg-white/10"
            title="完整管理">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 当前页面快捷操作 */}
      {currentTab && (
        <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{currentTab.title}</div>
              <div className="truncate text-xs text-gray-500 dark:text-gray-400">{currentTab.url}</div>
            </div>
            <button
              onClick={handleAddBookmark}
              disabled={isBookmarked}
              className={`flex-shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                isBookmarked
                  ? 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title={isBookmarked ? '已收藏' : '添加到书签'}>
              {isBookmarked ? '已收藏' : '+ 收藏'}
            </button>
          </div>
        </div>
      )}

      {/* 搜索栏 */}
      <div className="border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            type="text"
            placeholder="搜索书签..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-1.5 pl-8 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      </div>

      {/* 搜索结果 */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery && searchResults.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <Search className="mx-auto mb-2 h-10 w-10 opacity-40" />
              <p className="text-sm">未找到匹配的书签</p>
            </div>
          </div>
        )}

        {searchQuery && searchResults.length > 0 && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {searchResults.map((bookmark, index) => (
              <button
                key={bookmark.id}
                onClick={() => handleOpenBookmark(bookmark.url!)}
                className={`flex w-full items-start gap-2 px-3 py-2 text-left transition-colors ${
                  index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{bookmark.title}</div>
                  <div className="truncate text-xs text-gray-500 dark:text-gray-400">{bookmark.url}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!searchQuery && (
          <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="px-3 text-center">
              <Search className="mx-auto mb-2 h-12 w-12 opacity-40" />
              <p className="mb-1 text-sm font-medium">搜索你的书签</p>
              <p className="text-xs">在上方输入关键词</p>
              <button
                onClick={openOptionsPage}
                className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700">
                <Settings className="h-3.5 w-3.5" />
                完整管理页面
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
