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

export interface DuplicateBookmark {
  url: string;
  bookmarks: BookmarkNode[];
}

export interface BookmarkStats {
  totalCount: number;
  folderCount: number;
  duplicateCount: number;
}
