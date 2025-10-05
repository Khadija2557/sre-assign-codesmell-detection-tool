import { useState, useCallback } from "react"

type Toast = {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast])
    setTimeout(() => setToasts((prev) => prev.slice(1)), 3000)
  }, [])

  return { toast, toasts }
}