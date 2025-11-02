import '@src/Options.css';
import { BookmarkManager } from './components/BookmarkManager';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';

const Options = () => (
  <div className="min-h-screen bg-slate-50 text-gray-900">
    <BookmarkManager />
  </div>
);

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
