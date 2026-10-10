import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, ImagePlus, ScanSearch, Trash2, UploadCloud } from 'lucide-react'
import ResultCard from '../components/ResultCard'
import { ErrorMessage, Loading } from '../components/Feedback'
import { SELECTABLE_CATEGORIES } from '../data/categories'
import { useProgress } from '../hooks/useProgress'
import { ApiError, classifyImage, getGuidance } from '../services/api'
import type { CategoryId, ClassificationResult } from '../types'
import { addScan, correctScan, setLearned } from '../utils/progressStore'
import { takePendingFile } from '../utils/pendingFile'
import { MAX_UPLOAD_MB, validateImageFile } from '../utils/validation'

type Status = 'idle' | 'loading' | 'unavailable' | 'result'

export default function Scan() {
  const { data } = useProgress()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ClassificationResult | null>(null)
  const [unavailableReason, setUnavailableReason] = useState<string | null>(null)
  const [scanId, setScanId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const cameraInput = useRef<HTMLInputElement>(null)

  // Revoke object URLs when replaced/unmounted. Images are never persisted.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const resetAll = useCallback(() => {
    setFile(null)
    setPreviewUrl(null)
    setStatus('idle')
    setError(null)
    setResult(null)
    setUnavailableReason(null)
    setScanId(null)
    if (fileInput.current) fileInput.current.value = ''
    if (cameraInput.current) cameraInput.current.value = ''
  }, [])

  const acceptFile = useCallback((f: File) => {
    const problem = validateImageFile(f)
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    setResult(null)
    setScanId(null)
    setUnavailableReason(null)
    setStatus('idle')
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }, [])

  useEffect(() => {
    const pending = takePendingFile()
    if (pending) acceptFile(pending)
  }, [acceptFile])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) acceptFile(f)
    e.target.value = ''
  }

  const analyze = async () => {
    if (!file) return
    setError(null)
    setStatus('loading')
    try {
      const res = await classifyImage(file)
      const imageNotAnalysed = res.source === 'demo_fallback' && res.category === 'unknown' && !!res.fallback_reason
      if (imageNotAnalysed) {
        setUnavailableReason(res.fallback_reason ?? 'AI classification is unavailable.')
        setStatus('unavailable')
        return
      }
      setResult(res)
      setScanId(addScan({ itemName: res.item_name, category: res.category, source: res.source }))
      setStatus('result')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong while analysing the image.')
      setStatus('idle')
    }
  }

  const chooseManually = async (category: CategoryId) => {
    setBusy(true)
    setError(null)
    try {
      const res = await getGuidance(category)
      setResult(res)
      setScanId(addScan({ itemName: res.item_name, category: res.category, source: 'demo_fallback' }))
      setStatus('result')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load guidance.')
    } finally {
      setBusy(false)
    }
  }

  const handleCorrect = async (category: CategoryId) => {
    if (!scanId || !result) return
    setBusy(true)
    try {
      const guidance = await getGuidance(category)
      correctScan(scanId, category)
      setResult({
        ...result,
        category,
        preparation_steps: guidance.preparation_steps,
        disposal_instruction: guidance.disposal_instruction,
        warning: guidance.warning,
        uncertain: false,
        confidence: null,
        source: 'rules',
        reason: 'Guidance for the category you selected, from the curated knowledge base.',
      })
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not load guidance for that category.')
    } finally {
      setBusy(false)
    }
  }

  const record = scanId ? data.scans.find((s) => s.id === scanId) : undefined

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Scan an item</h1>
        <p className="mt-1 text-ink-soft">
          Upload or take a photo of one waste item. Images are sent for analysis and are not stored.
        </p>
      </header>

      {error && <ErrorMessage message={error} />}

      {status === 'result' && result && record ? (
        <ResultCard
          result={result}
          imageUrl={previewUrl}
          originalCategory={record.originalCategory}
          corrected={record.corrected}
          learned={record.learned}
          correctionBusy={busy}
          onCorrect={handleCorrect}
          onToggleLearned={() => setLearned(record.id, !record.learned)}
          onScanAnother={resetAll}
        />
      ) : status === 'loading' ? (
        <div className="rounded-3xl border border-line bg-white p-6">
          {previewUrl && <img src={previewUrl} alt="Your upload" className="mx-auto mb-4 max-h-64 rounded-2xl object-contain" />}
          <Loading label="Analysing your item…" />
        </div>
      ) : status === 'unavailable' ? (
        <section className="space-y-4 rounded-3xl border border-amber-300 bg-amber-50 p-5 sm:p-6" aria-labelledby="unavail-h">
          <h2 id="unavail-h" className="text-lg font-semibold text-amber-950">Image analysis isn't available right now</h2>
          <p className="text-sm text-amber-950">
            {unavailableReason} BinVision did <strong>not</strong> recognise your item. You can still use demo mode: pick a
            category yourself to see the general guidance.
          </p>
          {previewUrl && <img src={previewUrl} alt="Your upload" className="max-h-48 rounded-2xl object-contain" />}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a category">
            {SELECTABLE_CATEGORIES.map((c) => (
              <button
                key={c.id}
                disabled={busy}
                onClick={() => chooseManually(c.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${c.badge}`}
              >
                <c.icon className="h-4 w-4" aria-hidden="true" /> {c.short}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={analyze} className="rounded-full border border-amber-400 bg-white px-4 py-2 text-sm font-semibold">
              Try again
            </button>
            <button onClick={resetAll} className="rounded-full border border-amber-400 bg-white px-4 py-2 text-sm font-semibold">
              Start over
            </button>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {previewUrl && file ? (
            <div className="rounded-3xl border border-line bg-white p-4 sm:p-6">
              <img src={previewUrl} alt="Preview of the selected item" className="mx-auto max-h-80 w-full rounded-2xl object-contain" />
              <p className="mt-3 truncate text-center text-sm text-ink-soft">
                {file.name} · {(file.size / 1024).toFixed(0)} KB
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  onClick={analyze}
                  className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3 font-semibold text-white hover:bg-forest-800"
                >
                  <ScanSearch className="h-5 w-5" aria-hidden="true" /> Analyse item
                </button>
                <button
                  onClick={() => fileInput.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-3 text-sm font-semibold hover:bg-sand"
                >
                  <ImagePlus className="h-4 w-4" aria-hidden="true" /> Replace
                </button>
                <button
                  onClick={resetAll}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-3 text-sm font-semibold hover:bg-sand"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                const f = e.dataTransfer.files?.[0]
                if (f) acceptFile(f)
              }}
              className={`flex flex-col items-center rounded-3xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
                dragging ? 'border-forest-700 bg-forest-50' : 'border-line bg-white'
              }`}
            >
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest-100 text-forest-800">
                <UploadCloud className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="text-lg font-semibold">Drop a photo here</h2>
              <p className="mt-1 text-sm text-ink-soft">JPEG, PNG or WebP · up to {MAX_UPLOAD_MB} MB</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => fileInput.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-6 py-3 font-semibold text-white hover:bg-forest-800"
                >
                  <ImagePlus className="h-5 w-5" aria-hidden="true" /> Choose photo
                </button>
                <button
                  onClick={() => cameraInput.current?.click()}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-semibold hover:bg-sand"
                >
                  <Camera className="h-5 w-5" aria-hidden="true" /> Use camera
                </button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-white p-4 text-sm text-ink-soft">
            <strong className="text-ink">Tip:</strong> photograph one item in good light, filling most of the frame. For
            batteries, electronics, chemicals or broken glass, follow the safety notes in the result.
          </div>
        </section>
      )}

      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} aria-label="Choose an image file" onChange={onInputChange} />
      <input ref={cameraInput} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-label="Take a photo with the camera" onChange={onInputChange} />
    </div>
  )
}
