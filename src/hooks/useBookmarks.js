import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage('network-logs:bookmarks', [])

  const toggleBookmark = useCallback((logId) => {
    setBookmarks((current) => current.some((item) => item.logId === logId)
      ? current.filter((item) => item.logId !== logId)
      : [{ logId, createdAt: new Date().toISOString(), note: '' }, ...current])
  }, [setBookmarks])

  const updateNote = useCallback((logId, note) => {
    setBookmarks((current) => current.map((item) => item.logId === logId ? { ...item, note } : item))
  }, [setBookmarks])

  return { bookmarks, toggleBookmark, updateNote }
}
