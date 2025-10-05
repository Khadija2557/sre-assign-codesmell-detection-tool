import * as React from "react"

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={`bg-input text-foreground border border-border ${className}`} {...props} />
))
Input.displayName = "Input"