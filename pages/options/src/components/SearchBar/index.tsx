import { Search, RefreshCw, Download, Undo, FolderPlus } from 'lucide-react';
import type React from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onExport: () => void;
  onCreateRootFolder?: () => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  onExport,
  onCreateRootFolder,
  onUndo,
  canUndo = false,
}) => (
  <div className="flex flex-col gap-4 md:flex-row">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
      <input
        type="text"
        placeholder="搜索书签..."
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        className="w-full rounded-lg border py-2 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
      />
    </div>

    <div className="flex gap-2">
      {onCreateRootFolder && (
        <button
          onClick={onCreateRootFolder}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          <FolderPlus className="h-4 w-4" />
          新建文件夹
        </button>
      )}

      {onUndo && (
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500">
          <Undo className="h-4 w-4" />
          撤销
        </button>
      )}

      <button
        onClick={onExport}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        <Download className="h-4 w-4" />
        导出
      </button>

      <button
        onClick={onRefresh}
        className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
        <RefreshCw className="h-4 w-4" />
      </button>
    </div>
  </div>
);
