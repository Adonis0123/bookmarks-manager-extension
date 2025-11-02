import type { BookmarkNode } from '../types/bookmark';

/**
 * 根据搜索关键词过滤书签树
 */
export const filterBookmarks = (nodes: BookmarkNode[], query: string): BookmarkNode[] => {
  if (!query) return nodes;

  const lowerQuery = query.toLowerCase();

  return nodes.reduce((acc: BookmarkNode[], node) => {
    const matchesQuery = node.title?.toLowerCase().includes(lowerQuery) || node.url?.toLowerCase().includes(lowerQuery);

    if (node.children) {
      const filteredChildren = filterBookmarks(node.children, query);
      if (filteredChildren.length > 0 || matchesQuery) {
        acc.push({
          ...node,
          children: filteredChildren,
        });
      }
    } else if (matchesQuery) {
      acc.push(node);
    }

    return acc;
  }, []);
};

/**
 * 收集所有书签节点的 ID
 */
export const collectAllIds = (nodes: BookmarkNode[]): Set<string> => {
  const ids = new Set<string>();

  const collect = (nodeList: BookmarkNode[]) => {
    nodeList.forEach(node => {
      ids.add(node.id);
      if (node.children) {
        collect(node.children);
      }
    });
  };

  collect(nodes);
  return ids;
};

/**
 * 收集所有文件夹的 ID
 */
export const collectFolderIds = (nodes: BookmarkNode[]): Set<string> => {
  const folderIds = new Set<string>();

  const collect = (nodeList: BookmarkNode[]) => {
    nodeList.forEach(node => {
      if (node.children) {
        folderIds.add(node.id);
        collect(node.children);
      }
    });
  };

  collect(nodes);
  return folderIds;
};

/**
 * 收集指定深度的文件夹 ID（用于初始展开）
 */
export const collectTopFolders = (nodes: BookmarkNode[], maxDepth: number): Set<string> => {
  const folderIds = new Set<string>();

  const collect = (nodeList: BookmarkNode[], currentDepth: number) => {
    if (currentDepth >= maxDepth) return;

    nodeList.forEach(node => {
      if (node.children) {
        folderIds.add(node.id);
        collect(node.children, currentDepth + 1);
      }
    });
  };

  collect(nodes, 0);
  return folderIds;
};

/**
 * 从树中查找节点
 */
export const findNodeById = (nodes: BookmarkNode[], id: string): BookmarkNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};
