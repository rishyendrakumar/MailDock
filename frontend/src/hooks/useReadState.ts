import { useState, useCallback, useRef } from 'react';

const READ_KEY = 'maildock-read-emails';

function loadReadSet(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {}
  return new Set();
}

function saveReadSet(set: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...set]));
}

export function useReadState() {
  const readSetRef = useRef<Set<string>>(loadReadSet());
  const [, forceUpdate] = useState(0);

  const isRead = useCallback((id: string) => readSetRef.current.has(id), []);

  const markRead = useCallback((id: string) => {
    if (!readSetRef.current.has(id)) {
      readSetRef.current.add(id);
      saveReadSet(readSetRef.current);
      forceUpdate((n) => n + 1);
    }
  }, []);

  const markUnread = useCallback((id: string) => {
    if (readSetRef.current.has(id)) {
      readSetRef.current.delete(id);
      saveReadSet(readSetRef.current);
      forceUpdate((n) => n + 1);
    }
  }, []);

  const markAllRead = useCallback((ids: string[]) => {
    let changed = false;
    ids.forEach((id) => {
      if (!readSetRef.current.has(id)) {
        readSetRef.current.add(id);
        changed = true;
      }
    });
    if (changed) {
      saveReadSet(readSetRef.current);
      forceUpdate((n) => n + 1);
    }
  }, []);

  return { isRead, markRead, markUnread, markAllRead };
}
