"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/scroll-area"
import type { AnalyzeResponse } from "@/lib/types"

export default function ResultsPanel({ result }: { result: AnalyzeResponse | null }) {
  if (!result) {
    return (
      <div className="rounded-xl bg-gradient-to-r from-[var(--color-primary)]/40 to-transparent p-[1px]">
        <Card className="card-elevated h-full rounded-[calc(var(--radius)+2px)] hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Results</CardTitle>
            <CardDescription>Run an analysis to see findings here.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The report will list active smells, counts, and locations with brief explanations.
          </CardContent>
        </Card>
      </div>
    )
  }
  const smells = Object.entries(result.findings)
  return (
    <div className="rounded-xl bg-gradient-to-r from-[var(--color-primary)]/40 to-transparent p-[1px]">
      <Card className="card-elevated h-full rounded-[calc(var(--radius)+2px)] hover:shadow-md motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-right-2">
        <CardHeader>
          <CardTitle className="text-lg">Results</CardTitle>
          <CardDescription>
            Active smells evaluated:{" "}
            {result.activeSmells.length === 0 ? (
              <span className="text-muted-foreground">None</span>
            ) : (
              <span className="inline-flex flex-wrap gap-1">
                {result.activeSmells.map((s) => (
                  <Badge key={s} variant="secondary" className="hover:bg-secondary/70">
                    {s}
                  </Badge>
                ))}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {smells.length === 0 ? (
            <p className="text-sm text-muted-foreground">No findings.</p>
          ) : (
            <ScrollArea className="h-[480px] rounded-md border pr-2" type="auto">
              <div className="p-4">
                {smells.map(([name, data], idx) => (
                  <div key={name} className="pb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-base font-semibold">{name}</h3>
                      <Badge variant={data.count > 0 ? "default" : "secondary"}>{data.count}</Badge>
                    </div>
                    {data.count === 0 ? (
                      <p className="text-sm text-muted-foreground">No issues detected.</p>
                    ) : (
                      <ul className="space-y-2 text-sm">
                        {data.items.map((it, i) => (
                          <li
                            key={`${name}-${i}`}
                            className="p-[1px] rounded-md bg-gradient-to-r from-[var(--color-primary)]/35 to-transparent motion-safe:animate-in motion-safe:fade-in-50 motion-safe:zoom-in-95"
                          >
                            <div className="rounded-[calc(var(--radius)-2px)] border bg-background/70 p-3 transition-all hover:-translate-y-0.5 hover:border-[var(--color-primary)]/50 hover:bg-secondary/40">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">{it.file}</Badge>
                                <span className="text-muted-foreground">
                                  Lines {it.lineStart}-{it.lineEnd}
                                </span>
                              </div>
                              <p className="mt-1 whitespace-pre-wrap break-words">{it.message}</p>
                              {it.snippet ? (
                                <pre className="mt-2 block w-full overflow-x-auto rounded bg-muted/70 p-2 text-xs leading-6">
                                  {it.snippet}
                                </pre>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    {idx < smells.length - 1 && <Separator className="my-4" />}
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