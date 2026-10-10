export type CategoryId =
  | 'paper_cardboard'
  | 'plastic'
  | 'metal'
  | 'glass'
  | 'organic'
  | 'ewaste'
  | 'batteries_hazardous'
  | 'residual'
  | 'textile'
  | 'unknown'

export type ResultSource = 'ai' | 'rules' | 'demo_fallback'

/** Mirrors the backend ClassificationResult Pydantic model. */
export interface ClassificationResult {
  item_name: string
  category: CategoryId
  material: string
  confidence: number | null
  preparation_steps: string[]
  disposal_instruction: string
  reason: string
  warning: string | null
  uncertain: boolean
  source: ResultSource
  local_rules_notice: string
  fallback_reason?: string | null
}

export interface CategoryGuidance {
  id: CategoryId
  label: string
  summary: string
  examples: string[]
  preparation_steps: string[]
  disposal_route: string
  common_mistakes: string[]
  safety: string | null
  local_variation_note: string
}

export interface ScanRecord {
  id: string
  timestamp: number
  itemName: string
  /** Category returned by the classifier or manual selection. */
  originalCategory: CategoryId
  /** Category after any user correction (equals originalCategory if none). */
  finalCategory: CategoryId
  corrected: boolean
  source: ResultSource
  learned: boolean
}

export interface QuizRoundRecord {
  id: string
  timestamp: number
  score: number
  correct: number
  total: number
}

export interface ProgressData {
  version: 1
  scans: ScanRecord[]
  rounds: QuizRoundRecord[]
}

export interface QuizQuestion {
  id: string
  prompt: string
  options: [string, string, string, string]
  correctIndex: number
  explanation: string
}
