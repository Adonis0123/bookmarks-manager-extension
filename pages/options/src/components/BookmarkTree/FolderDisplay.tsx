import { Folder, FolderOpen } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type React from 'react';

interface FolderDisplayProps {
  title: string;
  isExpanded: boolean;
  childrenCount: number;
  isEditing: boolean;
  onTitleChange?: (newTitle: string) => void;
  onEditComplete?: () => void;
}

export const FolderDisplay: React.FC<FolderDisplayProps> = ({
  title,
  isExpanded,
  childrenCount,
  isEditing,
  onTitleChange,
  onEditComplete,
}) => {
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditValue(title);
      // 聚焦并选中所有文本
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [isEditing, title]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== title) {
      onTitleChange?.(trimmedValue);
    }
    onEditComplete?.();
  };

  const handleCancel = () => {
    setEditValue(title);
    onEditComplete?.();
  };

  const handleBlur = () => {
    // 延迟处理，避免与按钮点击冲突
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 200);
  };

  if (isEditing) {
    return (
      <>
        {isExpanded ? (
          <FolderOpen className="h-4 w-4 flex-shrink-0 text-blue-600" />
        ) : (
          <Folder className="h-4 w-4 flex-shrink-0 text-blue-600" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex-1 truncate rounded border border-blue-500 px-1 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          onClick={e => e.stopPropagation()}
        />
        <span className="flex-shrink-0 text-xs text-gray-500">({childrenCount})</span>
      </>
    );
  }

  return (
    <>
      {isExpanded ? (
        <FolderOpen className="h-4 w-4 flex-shrink-0 text-blue-600" />
      ) : (
        <Folder className="h-4 w-4 flex-shrink-0 text-blue-600" />
      )}
      <span className="truncate text-sm font-medium text-gray-900">{title || '无标题文件夹'}</span>
      <span className="flex-shrink-0 text-xs text-gray-500">({childrenCount})</span>
    </>
  );
};
