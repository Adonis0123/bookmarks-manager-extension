import { BookmarkFolder } from './BookmarkFolder';
import { BookmarkItem } from './BookmarkItem';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@extension/ui';
import type { BookmarkNode } from '../types/bookmark';
import type React from 'react';

interface BookmarkTreeProps {
  items: BookmarkNode[];
  parentId: string;
  onDelete: (id: string) => void;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  duplicateUrls: Set<string>;
  expandedFolders?: Set<string>;
  onToggleFolder?: (folderId: string) => void;
  depth?: number;
}

export const BookmarkTree: React.FC<BookmarkTreeProps> = ({
  items,
  parentId,
  onDelete,
  selectedIds,
  onSelect,
  duplicateUrls,
  expandedFolders,
  onToggleFolder,
  depth = 0,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-${parentId}`,
    data: {
      type: 'container',
      parentId,
    },
  });

  const sortedItems = [...items].sort((a, b) => (a.index || 0) - (b.index || 0));
  const itemIds = sortedItems.map(item => item.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[20px] rounded-md transition-colors',
        isOver && 'bg-blue-50 dark:bg-blue-900/10',
        depth > 0 && 'ml-6',
      )}>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {sortedItems.map(item => {
          if (item.children) {
            return (
              <BookmarkFolder
                key={item.id}
                folder={item}
                onDelete={onDelete}
                selectedIds={selectedIds}
                onSelect={onSelect}
                duplicateUrls={duplicateUrls}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                depth={depth}
              />
            );
          }

          return (
            <BookmarkItem
              key={item.id}
              bookmark={item}
              onDelete={onDelete}
              isSelected={selectedIds.has(item.id)}
              onSelect={onSelect}
              isDuplicate={item.url ? duplicateUrls.has(item.url) : false}
              depth={depth}
            />
          );
        })}
      </SortableContext>
    </div>
  );
};
