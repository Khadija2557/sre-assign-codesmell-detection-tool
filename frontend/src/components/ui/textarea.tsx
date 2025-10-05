import * as React from "react"

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={`bg-input text-foreground border border-border ${className}`} {...props} />
))
Textarea.displayName = "Textarea"