import { Globe } from 'lucide-react';
import { useState } from 'react';
import type React from 'react';

interface BookmarkIconProps {
  url: string;
}

export const BookmarkIcon: React.FC<BookmarkIconProps> = ({ url }) => {
  const [faviconIndex, setFaviconIndex] = useState(0);

  // 多层降级策略获取 favicon
  const getFaviconUrls = (url: string): string[] => {
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        return [
          // 1. Chrome Manifest V3 官方 Favicon API（最可靠）
          `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=32`,
          // 2. DuckDuckGo 图标服务
          `https://icons.duckduckgo.com/ip3/${urlObj.hostname}.ico`,
          // 3. Google Favicon 服务（备选）
          `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`,
        ];
      }
    } catch {
      // URL 解析失败
    }
    return [];
  };

  const faviconUrls = getFaviconUrls(url);
  const currentFaviconUrl = faviconUrls[faviconIndex];

  const handleError = () => {
    // 尝试下一个 favicon 源
    if (faviconIndex < faviconUrls.length - 1) {
      setFaviconIndex(faviconIndex + 1);
    }
  };

  // 如果所有 favicon 源都失败，或没有有效的 URL，显示默认图标
  if (!currentFaviconUrl || faviconIndex >= faviconUrls.length) {
    return <Globe className="h-4 w-4 flex-shrink-0 text-gray-400" />;
  }

  return <img className="h-4 w-4 flex-shrink-0" src={currentFaviconUrl} alt="" onError={handleError} />;
};
