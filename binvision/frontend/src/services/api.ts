import type { CategoryGuidance, CategoryId, ClassificationResult } from '../types'

// Public, non-secret setting. Defaults to same-origin /api (Vite proxy in dev, Nginx in production).
const API_BASE: string = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || '/api'

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, init)
  } catch {
    throw new ApiError('Could not reach the BinVision server. Check your connection or try again shortly.')
  }
  if (!res.ok) {
    let detail = `The server returned an error (${res.status}).`
    try {
      const body = (await res.json()) as { detail?: unknown }
      if (typeof body.detail === 'string') detail = body.detail
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(detail, res.status)
  }
  try {
    return (await res.json()) as T
  } catch {
    throw new ApiError('The server sent an unreadable response.', res.status)
  }
}

export function classifyImage(file: File): Promise<ClassificationResult> {
  const form = new FormData()
  form.append('image', file)
  return request<ClassificationResult>('/classify', { method: 'POST', body: form })
}

export function getGuidance(category: CategoryId): Promise<ClassificationResult> {
  return request<ClassificationResult>(`/guidance/${category}`)
}

export function getCategories(): Promise<CategoryGuidance[]> {
  return request<CategoryGuidance[]>('/categories')
}

export function getHealth(): Promise<{ status: string; ai_available: boolean; version: string }> {
  return request('/health')
}
