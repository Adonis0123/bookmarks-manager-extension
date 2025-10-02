import type { BookmarkStats } from '../../types/bookmark';
import type React from 'react';

interface StatsCardsProps {
  stats: BookmarkStats;
  selectedCount: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, selectedCount }) => (
  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
    <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
      <div className="text-sm text-gray-600 dark:text-gray-400">总书签数</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCount}</div>
    </div>
    <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
      <div className="text-sm text-gray-600 dark:text-gray-400">文件夹数</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.folderCount}</div>
    </div>
    <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
      <div className="text-sm text-gray-600 dark:text-gray-400">重复书签</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.duplicateCount}</div>
    </div>
    <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
      <div className="text-sm text-gray-600 dark:text-gray-400">已选中</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedCount}</div>
    </div>
  </div>
);
