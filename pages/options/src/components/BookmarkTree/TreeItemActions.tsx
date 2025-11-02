import { Tooltip, cn } from '@extension/ui';
import { ExternalLink, Trash2, Edit, FolderPlus } from 'lucide-react';
import type React from 'react';

interface TreeItemActionsProps {
  hasUrl: boolean;
  isFolder: boolean;
  isHovered: boolean;
  onOpen?: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
  onCreateSubfolder?: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const TreeItemActions: React.FC<TreeItemActionsProps> = ({
  hasUrl,
  isFolder,
  isHovered,
  onOpen,
  onEdit,
  onCreateSubfolder,
  onDelete,
}) => (
  <div
    className={cn(
      'flex flex-shrink-0 items-center gap-1 transition-all duration-200',
      isHovered ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0',
    )}>
    {hasUrl && onOpen && (
      <Tooltip content="在新标签页打开">
        <button
          onClick={onOpen}
          className="rounded p-1 text-gray-600 transition-all hover:scale-110 hover:bg-gray-200 active:scale-95">
          <ExternalLink className="h-4 w-4" />
        </button>
      </Tooltip>
    )}

    {isFolder && onCreateSubfolder && (
      <Tooltip content="新建子文件夹">
        <button
          onClick={onCreateSubfolder}
          className="rounded p-1 text-green-600 transition-all hover:scale-110 hover:bg-green-100 active:scale-95">
          <FolderPlus className="h-4 w-4" />
        </button>
      </Tooltip>
    )}

    {onEdit && (
      <Tooltip content="编辑标题">
        <button
          onClick={onEdit}
          className="rounded p-1 text-blue-600 transition-all hover:scale-110 hover:bg-blue-100 active:scale-95">
          <Edit className="h-4 w-4" />
        </button>
      </Tooltip>
    )}

    <Tooltip content="删除">
      <button
        onClick={onDelete}
        className="rounded p-1 text-red-600 transition-all hover:scale-110 hover:bg-red-100 active:scale-95">
        <Trash2 className="h-4 w-4" />
      </button>
    </Tooltip>
  </div>
);
