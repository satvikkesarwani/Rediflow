import { useState, useCallback } from 'react';

let _toastId = 0;
export function useToast() {
  const [toasts, setToasts] = useState([]);

  // Stable reference: wrapping in useCallback with empty deps means this function
  // is created once per component mount and never changes identity. This prevents
  // any useEffect that lists addToast in its dep array from re-running on every
  // toast dismiss (which previously triggered setToasts → re-render → new addToast).
  const addToast = useCallback((message, type = 'info') => {
    // Strip emojis if they exist in the message strings from previous calls
    const cleanMessage = message.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '').trim();

    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message: cleanMessage || message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, addToast, removeToast };
}
