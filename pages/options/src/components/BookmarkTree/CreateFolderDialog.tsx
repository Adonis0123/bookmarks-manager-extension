import { cn } from '@extension/ui';
import { FolderPlus, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type React from 'react';

interface CreateFolderDialogProps {
  onConfirm: (folderName: string) => void;
  onCancel: () => void;
  defaultValue?: string;
  parentFolderName?: string;
}

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  onConfirm,
  onCancel,
  defaultValue = '',
  parentFolderName,
}) => {
  const [folderName, setFolderName] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 聚焦输入框
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = folderName.trim();
    if (trimmedName) {
      onConfirm(trimmedName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">新建文件夹</h2>
          </div>
          <button
            onClick={onCancel}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {parentFolderName && (
            <div className="mb-3 rounded-md bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                将在「<span className="font-medium">{parentFolderName}</span>」下创建文件夹
              </p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="folderName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              文件夹名称
            </label>
            <input
              ref={inputRef}
              id="folderName"
              type="text"
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入文件夹名称"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                'border border-gray-300 text-gray-700 hover:bg-gray-50',
                'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
              )}>
              取消
            </button>
            <button
              type="submit"
              disabled={!folderName.trim()}
              className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                'bg-blue-600 text-white hover:bg-blue-700',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600',
              )}>
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
