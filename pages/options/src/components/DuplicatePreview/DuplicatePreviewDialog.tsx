import { cn } from '@extension/ui';
import { AlertCircle, ChevronDown, ChevronRight, Check, X, Folder, Search, Link as LinkIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { DuplicateBookmark } from '../../types/bookmark';
import type React from 'react';

interface DuplicatePreviewDialogProps {
  duplicates: DuplicateBookmark[];
  onConfirm: (duplicates: DuplicateBookmark[]) => void;
  onCancel: () => void;
}

export const DuplicatePreviewDialog: React.FC<DuplicatePreviewDialogProps> = ({ duplicates, onConfirm, onCancel }) => {
  const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [duplicateStates, setDuplicateStates] = useState<DuplicateBookmark[]>(duplicates);

  // 计算统计信息
  const stats = useMemo(() => {
    let toDelete = 0;
    let toKeep = 0;

    duplicateStates.forEach(dup => {
      dup.items.forEach(item => {
        if (item.isKeep) {
          toKeep++;
        } else {
          toDelete++;
        }
      });
    });

    return { toDelete, toKeep };
  }, [duplicateStates]);

  // 过滤重复项
  const filteredDuplicates = useMemo(() => {
    if (!searchQuery.trim()) return duplicateStates;

    const query = searchQuery.toLowerCase();
    return duplicateStates.filter(
      dup =>
        dup.url.toLowerCase().includes(query) ||
        dup.title.toLowerCase().includes(query) ||
        dup.items.some(item => item.path.toLowerCase().includes(query)),
    );
  }, [duplicateStates, searchQuery]);

  // 切换 URL 展开/折叠
  const toggleUrl = (url: string) => {
    const newExpanded = new Set(expandedUrls);
    if (newExpanded.has(url)) {
      newExpanded.delete(url);
    } else {
      newExpanded.add(url);
    }
    setExpandedUrls(newExpanded);
  };

  // 切换保留状态
  const toggleKeep = (url: string, itemIndex: number) => {
    setDuplicateStates(prev =>
      prev.map(dup => {
        if (dup.url === url) {
          // 确保至少保留一个
          const keepCount = dup.items.filter(item => item.isKeep).length;
          const currentItem = dup.items[itemIndex];

          // 如果当前是唯一保留的，不允许取消
          if (currentItem.isKeep && keepCount === 1) {
            return dup;
          }

          return {
            ...dup,
            items: dup.items.map((item, idx) => (idx === itemIndex ? { ...item, isKeep: !item.isKeep } : item)),
          };
        }
        return dup;
      }),
    );
  };

  // 全部展开/折叠
  const toggleAll = () => {
    if (expandedUrls.size > 0) {
      setExpandedUrls(new Set());
    } else {
      setExpandedUrls(new Set(filteredDuplicates.map(d => d.url)));
    }
  };

  const handleConfirm = () => {
    onConfirm(duplicateStates);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl dark:bg-gray-800">
        {/* Header */}
        <div className="border-b border-gray-200 p-5 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-50 p-2 dark:bg-yellow-900/20">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">重复书签预览</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                发现 {filteredDuplicates.length} 个重复 URL，共 {stats.toDelete + stats.toKeep} 个书签
              </p>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="mt-4 flex gap-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">保留 {stats.toKeep} 个</span>
            </div>
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">删除 {stats.toDelete} 个</span>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索 URL、标题或路径..."
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>
            <button
              onClick={toggleAll}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              {expandedUrls.size > 0 ? '全部折叠' : '全部展开'}
            </button>
          </div>
        </div>

        {/* Content - Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredDuplicates.map(duplicate => {
              const isExpanded = expandedUrls.has(duplicate.url);

              return (
                <div
                  key={duplicate.url}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                  {/* URL Header */}
                  <button
                    onClick={() => toggleUrl(duplicate.url)}
                    className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {duplicate.title}
                        </p>
                      </div>
                      <p className="mt-1 truncate text-xs text-gray-600 dark:text-gray-400">{duplicate.url}</p>
                    </div>
                    <span className="flex-shrink-0 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                      {duplicate.items.length} 个副本
                    </span>
                  </button>

                  {/* Items List */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/30">
                      {duplicate.items.map((item, idx) => (
                        <div
                          key={item.bookmark.id}
                          className={cn(
                            'flex items-start gap-3 p-4',
                            idx !== duplicate.items.length - 1 && 'border-b border-gray-200 dark:border-gray-700',
                          )}>
                          {/* Status Icon */}
                          <div className="flex-shrink-0 pt-0.5">
                            {item.isKeep ? (
                              <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                            ) : (
                              <div className="rounded-full bg-red-100 p-1 dark:bg-red-900/30">
                                <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </div>
                            )}
                          </div>

                          {/* Item Info */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.bookmark.title || '未命名'}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Folder className="h-3.5 w-3.5 flex-shrink-0" />
                              <span>{item.path}</span>
                            </div>
                          </div>

                          {/* Toggle Button */}
                          <button
                            onClick={() => toggleKeep(duplicate.url, idx)}
                            disabled={item.isKeep && duplicate.items.filter(i => i.isKeep).length === 1}
                            className={cn(
                              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                              item.isKeep
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40'
                                : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40',
                              item.isKeep &&
                                duplicate.items.filter(i => i.isKeep).length === 1 &&
                                'cursor-not-allowed opacity-50',
                            )}>
                            {item.isKeep ? '保留' : '删除'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredDuplicates.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              {searchQuery ? '没有找到匹配的重复项' : '没有重复的书签'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-5 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">删除后无法恢复，请确认后操作</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={stats.toDelete === 0}
                className={cn(
                  'rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all',
                  stats.toDelete > 0
                    ? 'bg-red-600 hover:bg-red-700 hover:shadow-lg'
                    : 'cursor-not-allowed bg-gray-400 dark:bg-gray-600',
                )}>
                确认删除 {stats.toDelete} 个书签
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
