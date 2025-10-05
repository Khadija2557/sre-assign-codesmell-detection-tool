import type { Metadata } from "next"
  import "../styles/global.css"

  export const metadata: Metadata = {
    title: "Code Smell Detector",
    description: "Analyze Python/Java code for code smells with an interactive UI.",
  }

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    )
  }