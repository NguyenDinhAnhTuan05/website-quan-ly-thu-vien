import { useState, useCallback } from "react";

export default function useToast(duration = 3500) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), duration);
  }, [duration]);

  return { toast, showToast };
}
