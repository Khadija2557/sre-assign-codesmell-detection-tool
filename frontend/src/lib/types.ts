export type SmellName =
  | "LongMethod"
  | "GodClass"
  | "DuplicatedCode"
  | "LargeParameterList"
  | "MagicNumbers"
  | "FeatureEnvy"

export type AnalyzeRequest = {
  files: Array<{ name: string; content: string; language?: string }>
  config?: {
    enabled?: Record<SmellName, boolean>
    only?: SmellName[]
    exclude?: SmellName[]
  }
}

export type FindingItem = {
  file: string
  lineStart: number
  lineEnd: number
  message: string
  snippet?: string
}

export type FindingGroup = {
  count: number
  items: FindingItem[]
}

export type AnalyzeResponse = {
  activeSmells: SmellName[]
  findings: Partial<Record<SmellName, FindingGroup>>
}
