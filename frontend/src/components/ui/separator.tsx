import * as React from "react"

export const Separator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`bg-border h-px ${className}`} {...props} />
))
Separator.displayName = "Separator"