import { BookmarkIcon } from '../BookmarkIcon';
import { cn, Tooltip } from '@extension/ui';
import { Folder, FolderOpen, ChevronRight, ChevronDown, ExternalLink, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { BookmarkNode } from '../../types/bookmark';
import type React from 'react';

interface BookmarkTreeProps {
  bookmarks: BookmarkNode[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
  duplicateUrls: Set<string>;
  onDelete: (id: string) => void;
  onMove: (itemId: string, targetParentId: string, targetIndex: number) => Promise<void>;
}

interface TreeItemProps {
  node: BookmarkNode;
  depth: number;
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
  duplicateUrls: Set<string>;
  onDelete: (id: string) => void;
  onDragStart: (node: BookmarkNode) => void;
  onDragOver: () => void;
  onDrop: (node: BookmarkNode) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
  node,
  depth,
  selectedIds,
  onSelect,
  expandedFolders,
  onToggleFolder,
  duplicateUrls,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const isFolder = !!node.children;
  const isExpanded = isFolder && expandedFolders.has(node.id);
  const isSelected = selectedIds.has(node.id);
  const isDuplicate = node.url ? duplicateUrls.has(node.url) : false;
  const [isDragOver, setIsDragOver] = useState(false);

  const handleToggle = () => {
    if (isFolder) {
      onToggleFolder(node.id);
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.url) {
      chrome.tabs.create({ url: node.url });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(node.id);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(node);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    onDragOver();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    onDrop(node);
  };

  return (
    <div>
      <div
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex items-center gap-2 rounded-md p-2 transition-colors hover:bg-gray-100',
          isSelected && 'bg-blue-50',
          isDragOver && 'bg-blue-100',
          isDuplicate && !isFolder && 'bg-yellow-50',
        )}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}>
        {/* 展开/折叠箭头 */}
        {isFolder && (
          <button onClick={handleToggle} className="flex-shrink-0 p-0.5">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>
        )}

        {/* 复选框 */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(node.id)}
          onClick={e => e.stopPropagation()}
          className="flex-shrink-0 rounded border-gray-300"
        />

        {/* 图标和标题 */}
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={handleToggle}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggle();
            }
          }}>
          {isFolder ? (
            <>
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 flex-shrink-0 text-blue-600" />
              ) : (
                <Folder className="h-4 w-4 flex-shrink-0 text-blue-600" />
              )}
              <span className="truncate text-sm font-medium text-gray-900">{node.title || '无标题文件夹'}</span>
              <span className="flex-shrink-0 text-xs text-gray-500">({node.children?.length || 0})</span>
            </>
          ) : (
            <>
              {node.url && <BookmarkIcon url={node.url} />}
              <span className="flex-1 truncate text-left text-sm text-gray-900">
                {node.title || node.url || '无标题'}
              </span>
              {isDuplicate && (
                <span className="flex-shrink-0 rounded bg-yellow-200 px-2 py-0.5 text-xs text-yellow-800">重复</span>
              )}
            </>
          )}
        </button>

        {/* 操作按钮 */}
        <div className="flex flex-shrink-0 items-center gap-1">
          {node.url && (
            <Tooltip content="在新标签页打开">
              <button onClick={handleOpen} className="rounded p-1 text-gray-600 hover:bg-gray-200">
                <ExternalLink className="h-4 w-4" />
              </button>
            </Tooltip>
          )}

          <Tooltip content="删除">
            <button onClick={handleDelete} className="rounded p-1 text-red-600 hover:bg-red-100">
              <Trash2 className="h-4 w-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 子节点 */}
      {isFolder && isExpanded && node.children && (
        <div>
          {node.children.map(child => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedIds={selectedIds}
              onSelect={onSelect}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              duplicateUrls={duplicateUrls}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const SimpleBookmarkTree: React.FC<BookmarkTreeProps> = ({
  bookmarks,
  selectedIds,
  onSelect,
  expandedFolders,
  onToggleFolder,
  duplicateUrls,
  onDelete,
  onMove,
}) => {
  const [draggedNode, setDraggedNode] = useState<BookmarkNode | null>(null);

  const handleDragStart = (node: BookmarkNode) => {
    setDraggedNode(node);
  };

  const handleDragOver = () => {
    // 可以在这里添加拖拽预览逻辑
  };

  const handleDrop = async (targetNode: BookmarkNode) => {
    if (!draggedNode || draggedNode.id === targetNode.id) {
      setDraggedNode(null);
      return;
    }

    try {
      // 如果目标是文件夹，移动到文件夹内
      if (targetNode.children) {
        await onMove(draggedNode.id, targetNode.id, 0);
      } else {
        // 如果目标是书签，移动到同一父级
        const targetParentId = targetNode.parentId || '0';
        const targetIndex = targetNode.index !== undefined ? targetNode.index + 1 : 0;
        await onMove(draggedNode.id, targetParentId, targetIndex);
      }
    } catch (error) {
      console.error('拖拽失败:', error);
    }

    setDraggedNode(null);
  };

  return (
    <div className="space-y-1">
      {bookmarks.map(node => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          selectedIds={selectedIds}
          onSelect={onSelect}
          expandedFolders={expandedFolders}
          onToggleFolder={onToggleFolder}
          duplicateUrls={duplicateUrls}
          onDelete={onDelete}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};
