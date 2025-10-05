import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AnalyzerClient from "@/components/analyzer-client"
export default function Page() {
  return (
    <main className="min-h-dvh">
      <section className="aqua-hero mx-auto max-w-6xl px-4 py-8 md:py-12">
        <header className="mb-8 space-y-2">
          <h1 className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-pretty text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
            Code Smell Detector
          </h1>
          <p className="text-muted-foreground">
            Upload or paste Python code, choose which smells to analyze, and get a concise report.
          </p>
        </header>
        <div className="rounded-xl bg-gradient-to-r from-[var(--color-primary)]/40 to-transparent p-[1px]">
          <Card className="card-elevated rounded-[calc(var(--radius)+2px)] border hover:-translate-y-0.5 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-pretty">Analyze Your Code</CardTitle>
              <CardDescription>Supports Python (.py). Toggle smells and run analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
                <AnalyzerClient />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}