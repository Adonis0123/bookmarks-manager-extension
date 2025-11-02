import { BookmarkIcon } from '../BookmarkIcon';
import { useState, useRef, useEffect } from 'react';
import type React from 'react';

interface BookmarkDisplayProps {
  title: string;
  url?: string;
  isDuplicate: boolean;
  isEditing: boolean;
  onTitleChange?: (newTitle: string) => void;
  onEditComplete?: () => void;
}

export const BookmarkDisplay: React.FC<BookmarkDisplayProps> = ({
  title,
  url,
  isDuplicate,
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
        {url && <BookmarkIcon url={url} />}
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex-1 truncate rounded border border-blue-500 px-1 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          onClick={e => e.stopPropagation()}
        />
        {isDuplicate && (
          <span className="flex-shrink-0 rounded bg-yellow-200 px-2 py-0.5 text-xs text-yellow-800">重复</span>
        )}
      </>
    );
  }

  return (
    <>
      {url && <BookmarkIcon url={url} />}
      <span className="flex-1 truncate text-left text-sm text-gray-900">{title || url || '无标题'}</span>
      {isDuplicate && (
        <span className="flex-shrink-0 rounded bg-yellow-200 px-2 py-0.5 text-xs text-yellow-800">重复</span>
      )}
    </>
  );
};
