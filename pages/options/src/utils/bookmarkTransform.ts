import type { BookmarkNode } from '../types/bookmark';

/**
 * 从树中递归删除节点
 */
export const removeNodeFromTree = (nodes: BookmarkNode[], targetId: string): BookmarkNode[] =>
  nodes.reduce((acc: BookmarkNode[], node) => {
    if (node.id === targetId) {
      return acc;
    }
    if (node.children) {
      const updatedChildren = removeNodeFromTree(node.children, targetId);
      acc.push({ ...node, children: updatedChildren });
    } else {
      acc.push(node);
    }
    return acc;
  }, []);

/**
 * 批量从树中删除节点
 */
export const removeBatchNodesFromTree = (nodes: BookmarkNode[], targetIds: string[]): BookmarkNode[] => {
  let updated = nodes;
  for (const id of targetIds) {
    updated = removeNodeFromTree(updated, id);
  }
  return updated;
};

/**
 * 检查节点是否为根文件夹
 */
export const isRootFolder = async (bookmarkId: string): Promise<boolean> => {
  try {
    const [bookmark] = await chrome.bookmarks.get(bookmarkId);
    return bookmark.parentId === '0';
  } catch {
    return false;
  }
};

/**
 * 获取多个节点的根文件夹信息
 */
export const getRootFolders = async (bookmarkIds: string[]): Promise<{ id: string; title: string }[]> => {
  const rootFolders: { id: string; title: string }[] = [];

  for (const id of bookmarkIds) {
    try {
      const [bookmark] = await chrome.bookmarks.get(id);
      if (bookmark.parentId === '0') {
        rootFolders.push({ id: bookmark.id, title: bookmark.title });
      }
    } catch (error) {
      console.error(`Failed to get bookmark ${id}:`, error);
    }
  }

  return rootFolders;
};
