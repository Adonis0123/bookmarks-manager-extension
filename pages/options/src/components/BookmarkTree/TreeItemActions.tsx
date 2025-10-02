import { Tooltip } from '@extension/ui';
import { ExternalLink, Trash2, Edit } from 'lucide-react';
import type React from 'react';

interface TreeItemActionsProps {
  hasUrl: boolean;
  onOpen?: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const TreeItemActions: React.FC<TreeItemActionsProps> = ({ hasUrl, onOpen, onEdit, onDelete }) => (
  <div className="flex flex-shrink-0 items-center gap-1">
    {hasUrl && onOpen && (
      <Tooltip content="在新标签页打开">
        <button onClick={onOpen} className="rounded p-1 text-gray-600 hover:bg-gray-200">
          <ExternalLink className="h-4 w-4" />
        </button>
      </Tooltip>
    )}

    {onEdit && (
      <Tooltip content="编辑标题">
        <button onClick={onEdit} className="rounded p-1 text-blue-600 hover:bg-blue-100">
          <Edit className="h-4 w-4" />
        </button>
      </Tooltip>
    )}

    <Tooltip content="删除">
      <button onClick={onDelete} className="rounded p-1 text-red-600 hover:bg-red-100">
        <Trash2 className="h-4 w-4" />
      </button>
    </Tooltip>
  </div>
);
