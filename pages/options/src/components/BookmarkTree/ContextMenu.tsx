import { cn } from '@extension/ui';
import { ExternalLink, Edit, Trash2, Copy, FolderOpen, FolderPlus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type React from 'react';

interface ContextMenuPosition {
  x: number;
  y: number;
}

interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface ContextMenuProps {
  position: ContextMenuPosition;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ position, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // 调整菜单位置，确保不会超出视窗
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      if (rect.right > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 8;
      }

      if (rect.bottom > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 8;
      }

      menuRef.current.style.left = `${adjustedX}px`;
      menuRef.current.style.top = `${adjustedY}px`;
    }
  }, [position]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
      style={{ left: position.x, top: position.y }}>
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }}
          disabled={item.disabled}
          className={cn(
            'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
            item.disabled
              ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
              : item.variant === 'danger'
                ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700',
          )}>
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// 创建常用的菜单项
export const createBookmarkMenuItems = (
  node: { url?: string; title: string },
  handlers: {
    onOpen?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onCopyUrl?: () => void;
  },
): ContextMenuItem[] => {
  const items: ContextMenuItem[] = [];

  if (node.url && handlers.onOpen) {
    items.push({
      label: '在新标签页打开',
      icon: <ExternalLink className="h-4 w-4" />,
      onClick: handlers.onOpen,
    });
  }

  if (node.url && handlers.onCopyUrl) {
    items.push({
      label: '复制链接',
      icon: <Copy className="h-4 w-4" />,
      onClick: handlers.onCopyUrl,
    });
  }

  if (handlers.onEdit) {
    items.push({
      label: '编辑标题',
      icon: <Edit className="h-4 w-4" />,
      onClick: handlers.onEdit,
    });
  }

  if (handlers.onDelete) {
    items.push({
      label: '删除',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handlers.onDelete,
      variant: 'danger',
    });
  }

  return items;
};

export const createFolderMenuItems = (handlers: {
  onCreateSubfolder?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onExpandAll?: () => void;
}): ContextMenuItem[] => {
  const items: ContextMenuItem[] = [];

  if (handlers.onCreateSubfolder) {
    items.push({
      label: '新建子文件夹',
      icon: <FolderPlus className="h-4 w-4" />,
      onClick: handlers.onCreateSubfolder,
    });
  }

  if (handlers.onExpandAll) {
    items.push({
      label: '展开所有子文件夹',
      icon: <FolderOpen className="h-4 w-4" />,
      onClick: handlers.onExpandAll,
    });
  }

  if (handlers.onEdit) {
    items.push({
      label: '编辑标题',
      icon: <Edit className="h-4 w-4" />,
      onClick: handlers.onEdit,
    });
  }

  if (handlers.onDelete) {
    items.push({
      label: '删除',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handlers.onDelete,
      variant: 'danger',
    });
  }

  return items;
};

export type { ContextMenuPosition, ContextMenuItem };
