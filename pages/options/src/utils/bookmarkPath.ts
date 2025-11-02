import type { BookmarkNode } from '../types/bookmark';

/**
 * 构建书签 ID 到节点的映射
 */
export const buildBookmarkMap = (
  nodes: BookmarkNode[],
  map: Map<string, BookmarkNode> = new Map(),
): Map<string, BookmarkNode> => {
  for (const node of nodes) {
    map.set(node.id, node);
    if (node.children) {
      buildBookmarkMap(node.children, map);
    }
  }
  return map;
};

/**
 * 获取书签的完整文件夹路径
 * @param bookmarkId 书签 ID
 * @param bookmarkMap 书签 ID 到节点的映射
 * @returns 路径字符串，例如 "书签栏 > 工作 > 开发工具"
 */
export const getBookmarkPath = (bookmarkId: string, bookmarkMap: Map<string, BookmarkNode>): string => {
  const path: string[] = [];
  const current = bookmarkMap.get(bookmarkId);

  // 向上遍历父节点，但不包括当前书签本身
  if (current?.parentId) {
    let parentId: string | undefined = current.parentId;

    while (parentId) {
      const parent = bookmarkMap.get(parentId);
      if (!parent) break;

      // 跳过根节点（id 为 '0'）
      if (parent.id !== '0') {
        path.unshift(parent.title || '未命名');
      }

      parentId = parent.parentId;
    }
  }

  return path.length > 0 ? path.join(' > ') : '未分类书签';
};

/**
 * 批量获取书签路径映射
 * @param bookmarkIds 书签 ID 数组
 * @param bookmarkMap 书签 ID 到节点的映射
 * @returns ID 到路径的映射
 */
export const getBookmarkPaths = (
  bookmarkIds: string[],
  bookmarkMap: Map<string, BookmarkNode>,
): Map<string, string> => {
  const pathMap = new Map<string, string>();

  for (const id of bookmarkIds) {
    pathMap.set(id, getBookmarkPath(id, bookmarkMap));
  }

  return pathMap;
};
