import { BookmarkItem } from './BookmarkItem';
import { cn } from '@extension/ui';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Trash2, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { BookmarkNode } from '../types/bookmark';
import type React from 'react';

interface BookmarkFolderProps {
  folder: BookmarkNode;
  onDelete: (id: string) => void;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  duplicateUrls: Set<string>;
  depth?: number;
}

export const BookmarkFolder: React.FC<BookmarkFolderProps> = ({
  folder,
  onDelete,
  selectedIds,
  onSelect,
  duplicateUrls,
  depth = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [isRootFolder, setIsRootFolder] = useState(false);

  // 检查是否为根文件夹
  useEffect(() => {
    chrome.bookmarks
      .get(folder.id)
      .then(([bookmark]) => {
        setIsRootFolder(bookmark.parentId === '0');
      })
      .catch(() => {
        setIsRootFolder(false);
      });
  }, [folder.id]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // 检查是否为根文件夹
    try {
      const [bookmark] = await chrome.bookmarks.get(folder.id);
      if (bookmark.parentId === '0') {
        alert('无法删除根书签文件夹');
        return;
      }
    } catch (error) {
      console.error('Failed to check bookmark:', error);
    }

    if (confirm(`确定要删除文件夹 "${folder.title}" 及其所有内容吗？`)) {
      onDelete(folder.id);
    }
  };

  const handleSelectFolder = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(folder.id);
  };

  const renderChildren = () => {
    if (!folder.children || folder.children.length === 0) return null;

    return folder.children.map(child => {
      if (child.children) {
        return (
          <BookmarkFolder
            key={child.id}
            folder={child}
            onDelete={onDelete}
            selectedIds={selectedIds}
            onSelect={onSelect}
            duplicateUrls={duplicateUrls}
            depth={depth + 1}
          />
        );
      }

      return (
        <BookmarkItem
          key={child.id}
          bookmark={child}
          onDelete={onDelete}
          isSelected={selectedIds.has(child.id)}
          onSelect={onSelect}
          isDuplicate={child.url ? duplicateUrls.has(child.url) : false}
          depth={depth + 1}
        />
      );
    });
  };

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700',
          selectedIds.has(folder.id) && 'bg-blue-50 dark:bg-blue-900/20',
        )}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
        onClick={handleToggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}>
        <button className="p-0">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {!isRootFolder && (
          <input
            type="checkbox"
            checked={selectedIds.has(folder.id)}
            onChange={handleSelectFolder}
            onClick={e => e.stopPropagation()}
            className="rounded border-gray-300 dark:border-gray-600"
          />
        )}

        <div className="flex flex-1 items-center gap-2">
          {isRootFolder ? (
            <>
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-purple-600" />
              ) : (
                <Folder className="h-4 w-4 text-purple-600" />
              )}
              <span className="text-sm font-medium text-purple-600">{folder.title || '无标题文件夹'}</span>
              <Lock className="h-3 w-3 text-purple-600" />
            </>
          ) : (
            <>
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-600" />
              ) : (
                <Folder className="h-4 w-4 text-blue-600" />
              )}
              <span className="text-sm font-medium">{folder.title || '无标题文件夹'}</span>
            </>
          )}
          <span className="text-xs text-gray-500">({folder.children?.length || 0})</span>
        </div>

        {!isRootFolder && (
          <button
            onClick={handleDelete}
            className="rounded p-1 text-red-600 opacity-0 transition-opacity hover:bg-red-100 group-hover:opacity-100 dark:hover:bg-red-900/20"
            title="删除文件夹">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {isExpanded && <div className="ml-2">{renderChildren()}</div>}
    </div>
  );
};
