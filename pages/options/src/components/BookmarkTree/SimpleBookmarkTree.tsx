import { BookmarkDisplay } from './BookmarkDisplay';
import { ConfirmDialog } from './ConfirmDialog';
import { ContextMenu, createBookmarkMenuItems, createFolderMenuItems } from './ContextMenu';
import { FolderDisplay } from './FolderDisplay';
import { TreeItemActions } from './TreeItemActions';
import { cn } from '@extension/ui';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { ContextMenuPosition } from './ContextMenu';
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
  onUpdate?: (id: string, newTitle: string) => Promise<void>;
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
  onUpdate?: (id: string, newTitle: string) => Promise<void>;
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
  onUpdate,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const isFolder = !!node.children;
  const isExpanded = isFolder && expandedFolders.has(node.id);
  const isSelected = selectedIds.has(node.id);
  const isDuplicate = node.url ? duplicateUrls.has(node.url) : false;
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(node.id);
    setShowDeleteConfirm(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTitleChange = async (newTitle: string) => {
    if (onUpdate) {
      await onUpdate(node.id, newTitle);
    }
  };

  const handleEditComplete = () => {
    setIsEditing(false);
  };

  const handleCopyUrl = () => {
    if (node.url) {
      navigator.clipboard.writeText(node.url);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 编辑模式下不处理快捷键
    if (isEditing) return;

    // 如果焦点在 checkbox 或其他输入元素上，不处理
    if ((e.target as HTMLElement).tagName === 'INPUT') return;

    switch (e.key) {
      case 'Delete':
        e.preventDefault();
        setShowDeleteConfirm(true);
        break;
      case 'F2':
        e.preventDefault();
        if (onUpdate) {
          handleEdit(e as unknown as React.MouseEvent);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (node.url) {
          handleOpen(e as unknown as React.MouseEvent);
        } else {
          handleToggle();
        }
        break;
      case 'c':
      case 'C':
        if ((e.ctrlKey || e.metaKey) && node.url) {
          e.preventDefault();
          handleCopyUrl();
        }
        break;
    }
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
        role="treeitem"
        aria-selected={isSelected}
        draggable
        tabIndex={0}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
        className={cn(
          'flex items-center gap-2 rounded-md p-2 transition-all duration-200 hover:bg-gray-100 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
          isSelected && 'bg-blue-50 ring-1 ring-blue-200',
          isDragOver && 'scale-[1.02] bg-blue-100 shadow-md ring-2 ring-blue-400',
          isDuplicate && !isFolder && 'bg-yellow-50 hover:bg-yellow-100',
          isHovered && 'bg-gray-50',
        )}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}>
        {/* 展开/折叠箭头 */}
        {isFolder && (
          <button
            onClick={handleToggle}
            className="flex-shrink-0 rounded p-0.5 transition-all hover:bg-gray-200 active:scale-95">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600 transition-transform" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600 transition-transform" />
            )}
          </button>
        )}

        {/* 复选框 */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(node.id)}
          onClick={e => e.stopPropagation()}
          className="flex-shrink-0 rounded border-gray-300 transition-all hover:scale-110 hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        />

        {/* 图标和标题 */}
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={handleToggle}
          onKeyDown={e => {
            // 编辑模式下不拦截键盘事件
            if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              handleToggle();
            }
          }}>
          {isFolder ? (
            <FolderDisplay
              title={node.title}
              isExpanded={isExpanded}
              childrenCount={node.children?.length || 0}
              isEditing={isEditing}
              onTitleChange={handleTitleChange}
              onEditComplete={handleEditComplete}
            />
          ) : (
            <BookmarkDisplay
              title={node.title}
              url={node.url}
              isDuplicate={isDuplicate}
              isEditing={isEditing}
              onTitleChange={handleTitleChange}
              onEditComplete={handleEditComplete}
            />
          )}
        </button>

        {/* 操作按钮 */}
        <TreeItemActions
          hasUrl={!!node.url}
          isHovered={isHovered}
          onOpen={node.url ? handleOpen : undefined}
          onEdit={onUpdate ? handleEdit : undefined}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <ContextMenu
          position={contextMenu}
          items={
            isFolder
              ? createFolderMenuItems({
                  onEdit: onUpdate
                    ? () => {
                        setIsEditing(true);
                      }
                    : undefined,
                  onDelete: () => setShowDeleteConfirm(true),
                })
              : createBookmarkMenuItems(node, {
                  onOpen: node.url
                    ? () => {
                        if (node.url) chrome.tabs.create({ url: node.url });
                      }
                    : undefined,
                  onEdit: onUpdate
                    ? () => {
                        setIsEditing(true);
                      }
                    : undefined,
                  onDelete: () => setShowDeleteConfirm(true),
                  onCopyUrl: handleCopyUrl,
                })
          }
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="确认删除"
          message={
            isFolder
              ? '删除文件夹将同时删除其中的所有书签和子文件夹，此操作无法撤销。'
              : '确定要删除此书签吗？此操作无法撤销。'
          }
          itemTitle={node.title}
          itemUrl={node.url}
          isFolder={isFolder}
          confirmText="删除"
          cancelText="取消"
          variant="danger"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

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
              onUpdate={onUpdate}
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
  onUpdate,
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
          onUpdate={onUpdate}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
};
