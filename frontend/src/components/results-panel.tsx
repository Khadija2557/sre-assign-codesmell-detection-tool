"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/scroll-area"
import type { AnalyzeResponse, FindingItem } from "@/lib/types"

function pluralize(count: number, singular: string, plural?: string) {
  if (count === 1) return `${count} ${singular}`
  return `${count} ${plural ?? `${singular}s`}`
}

function SnippetDisclosure({ snippet }: { snippet?: string }) {
  if (!snippet) return null
  return (
    <details className="mt-2 rounded-md bg-muted/60 p-2 text-xs">
      <summary className="cursor-pointer select-none font-medium text-muted-foreground hover:text-foreground">
        View snippet
      </summary>
      <pre className="mt-2 max-h-72 overflow-auto rounded bg-background/80 p-2 text-[11px] leading-6">
        {snippet}
      </pre>
    </details>
  )
}

type FindingSummary = {
  name: string
  count: number
  fileCount: number
  items: FindingItem[]
}

export default function ResultsPanel({ result }: { result: AnalyzeResponse | null }) {
  if (!result) {
    return (
      <div className="rounded-xl bg-gradient-to-r from-[var(--color-primary)]/40 to-transparent p-[1px]">
        <Card className="card-elevated h-full rounded-[calc(var(--radius)+2px)] hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Results</CardTitle>
            <p className="text-sm text-muted-foreground">Run an analysis to see findings here.</p>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The report will list active smells, counts, and locations with brief explanations.
          </CardContent>
        </Card>
      </div>
    )
  }

  const smellEntries = Object.entries(result.findings ?? {})
  const summaries: FindingSummary[] = smellEntries.map(([name, data]) => {
    const items = data?.items ?? []
    const uniqueFiles = new Set(items.map((it) => it.file))
    return {
      name,
      count: data?.count ?? 0,
      fileCount: uniqueFiles.size,
      items,
    }
  })

  const totalFindings = summaries.reduce((sum, s) => sum + s.count, 0)
  const totalFilesAnalyzed = summaries.reduce((files, summary) => {
    summary.items.forEach((item) => files.add(item.file))
    return files
  }, new Set<string>()).size

  return (
    <div className="rounded-xl bg-gradient-to-r from-[var(--color-primary)]/40 to-transparent p-[1px]">
      <Card className="card-elevated h-full rounded-[calc(var(--radius)+2px)] hover:shadow-md motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-right-2">
        <CardHeader>
          <CardTitle className="text-lg">Results</CardTitle>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>
              Active smells evaluated:{" "}
              {result.activeSmells.length === 0 ? (
                <span className="text-muted-foreground">None</span>
              ) : (
                <span className="inline-flex flex-wrap gap-1 align-middle">
                  {result.activeSmells.map((s) => (
                    <Badge key={s} variant="secondary" className="hover:bg-secondary/70">
                      {s}
                    </Badge>
                  ))}
                </span>
              )}
            </div>
            <p>Summary: {pluralize(totalFindings, "finding")} across {pluralize(totalFilesAnalyzed, "file")}.</p>
          </div>
        </CardHeader>
        <CardContent>
          {summaries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No findings.</p>
          ) : (
            <ScrollArea className="h-[620px] rounded-md border pr-2" type="auto">
              <div className="grid gap-3 p-4">
                {summaries.map((summary) => (
                  <div
                    key={summary.name}
                    className="rounded-lg border bg-background/80 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)]/50 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold">{summary.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {summary.count === 0
                            ? "No issues detected."
                            : `${pluralize(summary.count, "finding")} across ${pluralize(summary.fileCount || 0, "file")}.`}
                        </p>
                      </div>
                      <Badge variant={summary.count > 0 ? "default" : "secondary"}>{summary.count}</Badge>
                    </div>
                    {summary.count > 0 ? (
                      <details className="mt-3 rounded-md border border-dashed bg-muted/30 p-2 open:bg-muted/50">
                        <summary className="cursor-pointer select-none text-xs font-medium text-[var(--color-primary)] hover:underline">
                          View detailed findings
                        </summary>
                        <ul className="mt-2 space-y-2 text-sm">
                          {summary.items.map((item, idx) => (
                            <li
                              key={`${summary.name}-${idx}`}
                              className="rounded-md border bg-background/90 p-2 text-sm shadow-sm"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="font-mono text-[10px] md:text-xs">
                                  {item.file}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Lines {item.lineStart}-{item.lineEnd}
                                </span>
                              </div>
                              <p className="mt-1 text-sm">{item.message}</p>
                              <SnippetDisclosure snippet={item.snippet} />
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
