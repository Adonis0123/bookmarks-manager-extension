export interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
  parentId?: string;
  index?: number;
  dateAdded?: number;
  dateGroupModified?: number;
  unmodifiable?: 'managed';
}

export interface DuplicateBookmarkItem {
  bookmark: BookmarkNode;
  path: string;
  isKeep: boolean;
}

export interface DuplicateBookmark {
  url: string;
  title: string;
  items: DuplicateBookmarkItem[];
}

export interface BookmarkStats {
  totalCount: number;
  folderCount: number;
  duplicateCount: number;
}
