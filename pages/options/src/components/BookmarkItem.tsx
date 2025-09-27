import { BookmarkIcon } from './BookmarkIcon';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@extension/ui';
import { Trash2, ExternalLink, GripVertical } from 'lucide-react';
import type { BookmarkNode } from '../types/bookmark';
import type React from 'react';

interface BookmarkItemProps {
  bookmark: BookmarkNode;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isDuplicate?: boolean;
  depth?: number;
}

export const BookmarkItem: React.FC<BookmarkItemProps> = ({
  bookmark,
  onDelete,
  isSelected,
  onSelect,
  isDuplicate = false,
  depth = 0,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: bookmark.id,
    data: {
      type: 'bookmark',
      bookmark,
      parentId: bookmark.parentId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${depth * 20 + 12}px`,
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect(bookmark.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(bookmark.id);
  };

  const handleOpenUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmark.url) {
      chrome.tabs.create({ url: bookmark.url });
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700',
        isDragging && 'opacity-50',
        isDuplicate && 'bg-yellow-50 dark:bg-yellow-900/20',
        isSelected && 'bg-blue-50 dark:bg-blue-900/20',
      )}>
      <div {...attributes} {...listeners} className="cursor-move">
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleCheckboxChange}
        className="rounded border-gray-300 dark:border-gray-600"
      />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {bookmark.url && <BookmarkIcon url={bookmark.url} />}

        <span className="flex-1 truncate text-start text-sm">{bookmark.title || bookmark.url || '无标题'}</span>

        {isDuplicate && (
          <span className="rounded bg-yellow-200 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-700 dark:text-yellow-200">
            重复
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {bookmark.url && (
          <button
            onClick={handleOpenUrl}
            className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
            title="在新标签页打开">
            <ExternalLink className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={handleDelete}
          className="rounded p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
          title="删除">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
