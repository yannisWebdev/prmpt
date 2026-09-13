import { Bookmark, PanelRightClose } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { BookmarkItem } from './BookmarkItem'

export function BookmarkPanel({
  open, bookmarks, logsById, visibleLogIds, hiddenBookmarkId, onClose,
  onNavigate, onRemove, onUpdateNote, onReveal,
}) {
  return (
    <aside className={`bookmark-panel ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="bookmark-panel-inner">
        <div className="panel-header">
          <div><span>WORKSPACE</span><h2>Bookmarks & Notes</h2></div>
          <IconButton label="Close bookmarks panel" onClick={onClose}><PanelRightClose size={16} /></IconButton>
        </div>
        <div className="panel-count"><Bookmark size={12} /> {bookmarks.length} bookmarked event{bookmarks.length === 1 ? '' : 's'}</div>
        <div className="bookmarks-list">
          {bookmarks.length === 0 ? (
            <div className="empty-bookmarks">
              <Bookmark size={24} />
              <strong>No bookmarks yet</strong>
              <span>Use the bookmark icon on any log to save it here.</span>
            </div>
          ) : bookmarks.map((bookmark) => (
            <BookmarkItem
              key={bookmark.logId}
              bookmark={bookmark}
              log={logsById.get(bookmark.logId)}
              hidden={bookmark.logId === hiddenBookmarkId || !visibleLogIds.has(bookmark.logId)}
              onNavigate={onNavigate}
              onRemove={onRemove}
              onUpdateNote={onUpdateNote}
              onReveal={onReveal}
            />
          ))}
        </div>
      </div>
    </aside>
  )
}
