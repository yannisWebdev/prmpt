import { useCallback, useEffect, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored === null ? initialValue : JSON.parse(stored)
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // The app remains usable when browser storage is unavailable.
    }
  }, [key, value])

  const updateValue = useCallback((nextValue) => {
    setValue((current) => typeof nextValue === 'function' ? nextValue(current) : nextValue)
  }, [])

  return [value, updateValue]
}
