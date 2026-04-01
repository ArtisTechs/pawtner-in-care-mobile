import { useCallback, useEffect, useState } from "react";

export type ToastVariant = "error" | "success";

export type ToastState = {
  message: string;
  variant: ToastVariant;
} | null;

export const useToast = (durationMs = 2800) => {
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setToast(null);
    }, durationMs);

    return () => clearTimeout(timeoutId);
  }, [durationMs, toast]);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      setToast({ message, variant });
    },
    [],
  );

  return {
    hideToast,
    showToast,
    toast,
  };
};
