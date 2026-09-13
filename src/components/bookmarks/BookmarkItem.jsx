import { BookmarkX, Check, MapPin, StickyNote, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatLogTime } from '../../utils/formatDate'

export function BookmarkItem({ bookmark, log, hidden, onNavigate, onRemove, onUpdateNote, onReveal }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(bookmark.note)

  useEffect(() => setDraft(bookmark.note), [bookmark.note])

  const save = () => {
    onUpdateNote(bookmark.logId, draft.trim())
    setEditing(false)
  }

  if (!log) return null
  return (
    <article className="bookmark-item">
      <div className="bookmark-meta">
        <button type="button" className="bookmark-time" onClick={() => onNavigate(log.id)} title="Go to log">
          <MapPin size={12} />{formatLogTime(log.timestamp)}
        </button>
        <button type="button" className="remove-bookmark" onClick={() => onRemove(log.id)} aria-label={`Remove bookmark ${log.id}`} title="Remove bookmark">
          <BookmarkX size={13} />
        </button>
      </div>
      <button type="button" className="bookmark-summary" onClick={() => onNavigate(log.id)}>
        <strong>{log.deviceId}</strong><span className={`bookmark-severity ${log.severity.toLowerCase()}`}>{log.severity === 'WARNING' ? 'WARN' : log.severity}</span>
        <p>{log.message}</p>
      </button>

      {hidden && (
        <div className="hidden-bookmark">
          This log is hidden by the current filters.
          <button type="button" onClick={() => onReveal(log.id)}>Clear filters and show log</button>
        </div>
      )}

      {editing ? (
        <div className="note-editor">
          <textarea
            autoFocus
            aria-label={`Note for ${log.id}`}
            value={draft}
            maxLength={500}
            placeholder="Add field observation…"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') { setDraft(bookmark.note); setEditing(false) }
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') save()
            }}
          />
          <div><span>{draft.length}/500</span><button type="button" onClick={save}><Check size={12} /> Save</button></div>
        </div>
      ) : bookmark.note ? (
        <div className="bookmark-note">
          <button type="button" onClick={() => setEditing(true)} title="Edit note"><StickyNote size={12} /><span>{bookmark.note}</span></button>
          <button type="button" onClick={() => onUpdateNote(log.id, '')} aria-label={`Delete note for ${log.id}`} title="Delete note"><Trash2 size={12} /></button>
        </div>
      ) : (
        <button type="button" className="add-note" onClick={() => setEditing(true)}><StickyNote size={12} /> Add note</button>
      )}
    </article>
  )
}
