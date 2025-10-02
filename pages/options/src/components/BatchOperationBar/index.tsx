import { cn } from '@extension/ui';
import { FolderOpen, FolderClosed, CheckSquare, Square, Trash2, Copy } from 'lucide-react';
import type React from 'react';

interface BatchOperationBarProps {
  selectedCount: number;
  totalCount: number;
  duplicateCount: number;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onRemoveDuplicates: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  hasSelection: boolean;
  hasDuplicates: boolean;
}

export const BatchOperationBar: React.FC<BatchOperationBarProps> = ({
  selectedCount,
  totalCount,
  duplicateCount,
  onSelectAll,
  onDeleteSelected,
  onRemoveDuplicates,
  onExpandAll,
  onCollapseAll,
  hasSelection,
}) => (
  <div className="mb-4 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* 文件夹操作 */}
        <div className="flex items-center gap-1 border-r pr-2 dark:border-gray-600">
          <button
            onClick={onExpandAll}
            className={cn(
              'rounded p-1.5 transition-colors',
              hasSelection
                ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700',
            )}
            title={hasSelection ? `展开选中的文件夹 (${selectedCount}项)` : '展开所有文件夹'}>
            <FolderOpen className="h-4 w-4" />
          </button>
          <button
            onClick={onCollapseAll}
            className={cn(
              'rounded p-1.5 transition-colors',
              hasSelection
                ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700',
            )}
            title={hasSelection ? `折叠选中的文件夹 (${selectedCount}项)` : '折叠所有文件夹'}>
            <FolderClosed className="h-4 w-4" />
          </button>
        </div>

        {/* 选择操作 */}
        <div className="flex items-center gap-1 border-r pr-2 dark:border-gray-600">
          <button
            onClick={onSelectAll}
            className="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title={hasSelection ? '取消全选' : '全选'}>
            {hasSelection ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          </button>

          <button
            onClick={onDeleteSelected}
            disabled={selectedCount === 0}
            className={cn(
              'rounded p-1.5 transition-colors',
              selectedCount > 0
                ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                : 'cursor-not-allowed text-gray-300 dark:text-gray-600',
            )}
            title={`删除选中 (${selectedCount})`}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* 去重操作 */}
        {duplicateCount > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={onRemoveDuplicates}
              className="flex items-center gap-1 rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 transition-colors hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
              title="删除重复书签">
              <Copy className="h-3.5 w-3.5" />
              <span>去重 ({duplicateCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        {selectedCount > 0 && (
          <span className="font-medium text-blue-600 dark:text-blue-400">已选中 {selectedCount} 项</span>
        )}
        <span>共 {totalCount} 个书签</span>
      </div>
    </div>
  </div>
);
