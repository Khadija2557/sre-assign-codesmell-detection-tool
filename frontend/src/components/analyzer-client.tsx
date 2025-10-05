"use client"
  import React from "react"
  import { Button } from "@/components/ui/button"
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
  import { Textarea } from "@/components/ui/textarea"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Switch } from "@/components/ui/switch"
  import { Badge } from "@/components/ui/badge"
  import ResultsPanel from "@/components/results-panel"
  import type { AnalyzeRequest, AnalyzeResponse, SmellName } from "@/lib/types"
  import { cn } from "@/lib/utils"
  import { useToast } from "@/hooks/use-toast"

  type UploadItem = { name: string; content: string; language?: string }
  const DEFAULT_SMELLS: Record<SmellName, boolean> = {
    LongMethod: true,
    GodClass: true,
    DuplicatedCode: true,
    LargeParameterList: true,
    MagicNumbers: true,
    FeatureEnvy: true,
  }

  export default function AnalyzerClient() {
    const [files, setFiles] = React.useState<UploadItem[]>([])
    const [pasted, setPasted] = React.useState("")
    const [smells, setSmells] = React.useState(DEFAULT_SMELLS)
    const [only, setOnly] = React.useState("")
    const [exclude, setExclude] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [result, setResult] = React.useState<AnalyzeResponse | null>(null)
    const { toast } = useToast()

    function toggleSmell(name: SmellName) {
      setSmells((s) => ({ ...s, [name]: !s[name] }))
    }

    function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
      const fileList = e.target.files
      if (!fileList) return
      const readers: Promise<UploadItem>[] = []
      for (const f of Array.from(fileList)) {
        readers.push(
          new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                name: f.name,
                content: String(reader.result || ""),
              })
            }
            reader.onerror = reject
            reader.readAsText(f)
          }),
        )
      }
      Promise.all(readers)
        .then((items) => {
          setFiles((prev) => [...prev, ...items])
          toast({ title: "Files added", description: `${items.length} file(s) queued for analysis.` })
        })
        .catch(() => {
          toast({ title: "Error reading files", description: "Please try again.", variant: "destructive" })
        })
    }

    function extractPastedAsFile(): UploadItem[] {
      if (!pasted.trim()) return []
      const title = "pasted-code.txt"
      return [{ name: title, content: pasted }]
    }

    async function onAnalyze(e: React.FormEvent) {
      e.preventDefault()
      setLoading(true)
      setResult(null)
      const payload: AnalyzeRequest = {
        files: [...files, ...extractPastedAsFile()],
        config: {
          enabled: smells,
          only: only
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean) as SmellName[],
          exclude: exclude
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean) as SmellName[],
        },
      }
      if (payload.files.length === 0) {
        setLoading(false)
        toast({ title: "No code provided", description: "Paste or upload at least one file.", variant: "destructive" })
        return
      }
      try {
        console.log("Sending payload to /api/analyze:", payload)
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`HTTP ${res.status}: ${errorText || "Unknown error"}`)
        }
        const json = (await res.json()) as AnalyzeResponse
        console.log("Received response:", json)
        setResult(json)
        toast({
          title: "Analysis complete",
          description: `Evaluated ${json.activeSmells.length} smell(s) across ${payload.files.length} file(s).`,
        })
      } catch (err: any) {
        console.error("Analysis error:", err)
        toast({
          title: "Analysis failed",
          description: err?.message ?? "Unknown error",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    function removeFile(name: string) {
      setFiles((fs) => fs.filter((f) => f.name !== name))
    }

    const smellList: SmellName[] = [
      "LongMethod",
      "GodClass",
      "DuplicatedCode",
      "LargeParameterList",
      "MagicNumbers",
      "FeatureEnvy",
    ]
    return (
      <form onSubmit={onAnalyze} className="grid gap-6 md:grid-cols-5">
        <div className="grid gap-6 md:col-span-2">
          <div className="grid gap-2">
            <Label htmlFor="paste">Paste Code (optional)</Label>
            <Textarea
              id="paste"
              placeholder="Paste Python code here…"
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              className="min-h-40 focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            />
            <p className="text-xs text-muted-foreground">You can paste multiple snippets; also supports file uploads.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="files">Upload Files</Label>
            <Input
              id="files"
              type="file"
              multiple
              accept=".py,.java,.txt,.md,.json"
              onChange={onPickFiles}
              className="focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            />
            {files.length > 0 ? (
              <div className="mt-2 grid gap-2">
                <p className="text-xs text-muted-foreground">{files.length} file(s) ready:</p>
                <div className="flex flex-wrap gap-2">
                  {files.map((f) => (
                    <Badge
                      key={f.name}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/70 hover:shadow-sm"
                      onClick={() => removeFile(f.name)}
                      title="Click to remove"
                    >
                      {f.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <Card className="card-elevated hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Smell Selection</CardTitle>
              <CardDescription>
                Toggle smells or use Only/Exclude to fine-tune. Only overrides Exclude and toggles.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3">
                {smellList.map((n) => (
                  <div
                    key={n}
                    className="flex items-center justify-between rounded-md border p-3 hover:border-[var(--color-primary)]/50 hover:bg-secondary/50"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{n}</span>
                      <span className="text-xs text-muted-foreground">
                        {n === "LongMethod" && "Flags overly long functions/methods."}
                        {n === "GodClass" && "Flags oversized, multi-responsibility classes."}
                        {n === "DuplicatedCode" && "Detects repeated code blocks."}
                        {n === "LargeParameterList" && "Flags methods with too many params."}
                        {n === "MagicNumbers" && "Finds unexplained numeric literals."}
                        {n === "FeatureEnvy" && "Methods using foreign data more than their own."}
                      </span>
                    </div>
                    <Switch checked={smells[n]} onCheckedChange={() => toggleSmell(n)} aria-label={`Toggle ${n}`} />
                  </div>
                ))}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="only">Only (comma-separated)</Label>
                <Input
                  id="only"
                  placeholder="e.g. LongMethod,DuplicatedCode"
                  value={only}
                  onChange={(e) => setOnly(e.target.value)}
                  className="focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                />
                <p className="text-xs text-muted-foreground">If set, runs only these smells.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exclude">Exclude (comma-separated)</Label>
                <Input
                  id="exclude"
                  placeholder="e.g. MagicNumbers"
                  value={exclude}
                  onChange={(e) => setExclude(e.target.value)}
                  className="focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                />
                <p className="text-xs text-muted-foreground">Run all except these. Ignored if Only is set.</p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" disabled={loading} className="hover:shadow-md">
                  {loading ? "Analyzing…" : "Analyze"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="hover:shadow-md"
                  onClick={() => {
                    setFiles([])
                    setPasted("")
                    setOnly("")
                    setExclude("")
                    setSmells(DEFAULT_SMELLS)
                    setResult(null)
                  }}
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className={cn("min-h-40 md:col-span-3")}>
          <ResultsPanel result={result} />
        </div>
      </form>
    )
  }