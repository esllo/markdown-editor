import { useEffect } from 'react';

const handleKeyDownEvent = (e: KeyboardEvent) => {
  if (e.target && document && e.target === document.body) {
    e.preventDefault();
  }
};

export default function useShortcutLock() {
  useEffect(() => {
    if (window) {
      window.addEventListener('keydown', handleKeyDownEvent);
      return () => {
        window.removeEventListener('keydown', handleKeyDownEvent);
      };
    }
  });
}
