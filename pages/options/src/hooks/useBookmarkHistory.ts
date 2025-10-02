import { useCallback, useEffect, useState } from 'react';
import type { BookmarkNode } from '../types/bookmark';

const HISTORY_KEY = 'bookmark_history';
const MAX_HISTORY = 10;

interface DeleteAction {
  type: 'delete';
  timestamp: number;
  node: BookmarkNode;
  parentId: string;
  index: number;
}

interface MoveAction {
  type: 'move';
  timestamp: number;
  nodeId: string;
  oldParentId: string;
  oldIndex: number;
  newParentId: string;
  newIndex: number;
}

interface UpdateAction {
  type: 'update';
  timestamp: number;
  nodeId: string;
  oldTitle: string;
  newTitle: string;
}

type HistoryAction = DeleteAction | MoveAction | UpdateAction;

interface UseBookmarkHistoryReturn {
  history: HistoryAction[];
  canUndo: boolean;
  recordDelete: (node: BookmarkNode, parentId: string, index: number) => void;
  recordMove: (nodeId: string, oldParentId: string, oldIndex: number, newParentId: string, newIndex: number) => void;
  recordUpdate: (nodeId: string, oldTitle: string, newTitle: string) => void;
  undo: () => Promise<void>;
  clearHistory: () => void;
}

/**
 * 书签操作历史记录管理
 * 支持撤销最近 10 条操作
 */
export const useBookmarkHistory = (): UseBookmarkHistoryReturn => {
  const [history, setHistory] = useState<HistoryAction[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 保存历史记录到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }, [history]);

  const addToHistory = useCallback((action: HistoryAction) => {
    setHistory(prev => {
      const newHistory = [action, ...prev].slice(0, MAX_HISTORY);
      return newHistory;
    });
  }, []);

  const recordDelete = useCallback(
    (node: BookmarkNode, parentId: string, index: number) => {
      addToHistory({
        type: 'delete',
        timestamp: Date.now(),
        node,
        parentId,
        index,
      });
    },
    [addToHistory],
  );

  const recordMove = useCallback(
    (nodeId: string, oldParentId: string, oldIndex: number, newParentId: string, newIndex: number) => {
      addToHistory({
        type: 'move',
        timestamp: Date.now(),
        nodeId,
        oldParentId,
        oldIndex,
        newParentId,
        newIndex,
      });
    },
    [addToHistory],
  );

  const recordUpdate = useCallback(
    (nodeId: string, oldTitle: string, newTitle: string) => {
      addToHistory({
        type: 'update',
        timestamp: Date.now(),
        nodeId,
        oldTitle,
        newTitle,
      });
    },
    [addToHistory],
  );

  const undo = useCallback(async () => {
    if (history.length === 0) return;

    const action = history[0];

    try {
      switch (action.type) {
        case 'delete': {
          // 撤销删除：重新创建书签
          const { node, parentId, index } = action;
          if (node.url) {
            // 重新创建书签
            await chrome.bookmarks.create({
              parentId,
              index,
              title: node.title,
              url: node.url,
            });
          } else {
            // 重新创建文件夹（递归创建子项）
            const createFolderRecursively = async (
              folderNode: BookmarkNode,
              targetParentId: string,
              targetIndex?: number,
            ): Promise<void> => {
              const created = await chrome.bookmarks.create({
                parentId: targetParentId,
                index: targetIndex,
                title: folderNode.title,
              });

              if (folderNode.children) {
                for (let i = 0; i < folderNode.children.length; i++) {
                  await createFolderRecursively(folderNode.children[i], created.id, i);
                }
              }
            };

            await createFolderRecursively(node, parentId, index);
          }
          break;
        }

        case 'move': {
          // 撤销移动：移回原位置
          await chrome.bookmarks.move(action.nodeId, {
            parentId: action.oldParentId,
            index: action.oldIndex,
          });
          break;
        }

        case 'update': {
          // 撤销更新：恢复旧标题
          await chrome.bookmarks.update(action.nodeId, {
            title: action.oldTitle,
          });
          break;
        }
      }

      // 移除已撤销的操作
      setHistory(prev => prev.slice(1));
    } catch (error) {
      console.error('Failed to undo:', error);
      alert('撤销失败：' + (error as Error).message);
    }
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  return {
    history,
    canUndo: history.length > 0,
    recordDelete,
    recordMove,
    recordUpdate,
    undo,
    clearHistory,
  };
};
