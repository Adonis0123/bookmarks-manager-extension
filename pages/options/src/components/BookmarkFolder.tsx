import { BookmarkTree } from './BookmarkTree';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@extension/ui';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Trash2, Lock, GripVertical } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { BookmarkNode } from '../types/bookmark';
import type React from 'react';

interface BookmarkFolderProps {
  folder: BookmarkNode;
  onDelete: (id: string) => void;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  duplicateUrls: Set<string>;
  expandedFolders?: Set<string>;
  onToggleFolder?: (folderId: string) => void;
  depth?: number;
}

export const BookmarkFolder: React.FC<BookmarkFolderProps> = ({
  folder,
  onDelete,
  selectedIds,
  onSelect,
  duplicateUrls,
  expandedFolders,
  onToggleFolder,
  depth = 0,
}) => {
  const [localExpanded, setLocalExpanded] = useState(depth < 2);
  const isExpanded = expandedFolders ? expandedFolders.has(folder.id) : localExpanded;
  const [isRootFolder, setIsRootFolder] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: folder.id,
    disabled: isRootFolder, // 根文件夹不能被拖动
    data: {
      type: 'folder',
      folder,
      parentId: folder.parentId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${depth * 20 + 12}px`,
  };

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
    if (onToggleFolder) {
      onToggleFolder(folder.id);
    } else {
      setLocalExpanded(!localExpanded);
    }
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

  return (
    <div ref={setNodeRef} style={style} className={cn('w-full', isDragging && 'opacity-50')}>
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700',
          selectedIds.has(folder.id) && 'bg-blue-50 dark:bg-blue-900/20',
        )}
        onClick={handleToggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
          }
        }}>
        {!isRootFolder && (
          <div {...attributes} {...listeners} className="cursor-move">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        )}

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

      {isExpanded && folder.children && folder.children.length > 0 && (
        <BookmarkTree
          items={folder.children}
          parentId={folder.id}
          onDelete={onDelete}
          selectedIds={selectedIds}
          onSelect={onSelect}
          duplicateUrls={duplicateUrls}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
          depth={depth + 1}
        />
      )}
    </div>
  );
};
