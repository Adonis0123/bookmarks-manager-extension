import { cn } from '@extension/ui';
import { AlertCircle, Bookmark, Folder, Link as LinkIcon } from 'lucide-react';
import { useEffect } from 'react';
import type React from 'react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  itemTitle?: string;
  itemUrl?: string;
  isFolder?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  itemTitle,
  itemUrl,
  isFolder = false,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 p-5 dark:border-gray-700">
          <div
            className={cn(
              'rounded-full p-2',
              variant === 'danger' && 'bg-red-50 dark:bg-red-900/20',
              variant === 'warning' && 'bg-yellow-50 dark:bg-yellow-900/20',
              variant === 'info' && 'bg-blue-50 dark:bg-blue-900/20',
            )}>
            <AlertCircle
              className={cn(
                'h-5 w-5',
                variant === 'danger' && 'text-red-600 dark:text-red-400',
                variant === 'warning' && 'text-yellow-600 dark:text-yellow-400',
                variant === 'info' && 'text-blue-600 dark:text-blue-400',
              )}
            />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        </div>

        {/* Content */}
        <div className="space-y-4 p-5">
          <p className="text-gray-700 dark:text-gray-300">{message}</p>

          {/* 书签/文件夹信息卡片 */}
          {itemTitle && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex-shrink-0 rounded-md p-2',
                    isFolder
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
                  )}>
                  {isFolder ? <Folder className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1 space-y-2 text-left">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {isFolder ? '文件夹名称' : '书签标题'}
                    </p>
                    <p className="mt-1 font-medium text-gray-900 dark:text-gray-100">{itemTitle}</p>
                  </div>
                  {itemUrl && !isFolder && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        链接地址
                      </p>
                      <div className="mt-1 flex items-start gap-2">
                        <LinkIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <p className="break-all text-sm text-gray-600 dark:text-gray-400">{itemUrl}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-gray-200 p-5 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg',
              variant === 'danger' && 'bg-red-600 hover:bg-red-700',
              variant === 'warning' && 'bg-yellow-600 hover:bg-yellow-700',
              variant === 'info' && 'bg-blue-600 hover:bg-blue-700',
            )}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
