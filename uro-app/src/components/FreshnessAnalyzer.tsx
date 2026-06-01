import { useState, useRef } from 'react'
import { analyzeFreshness, type FreshnessResult } from '../server/gemini'

type Props = {
  onResult: (result: FreshnessResult, imageUrl: string) => void
}

export default function FreshnessAnalyzer({ onResult }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<FreshnessResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const FRESHNESS_COLOR: Record<string, string> = {
    สดมาก: '#16a34a',
    ดี: '#65a30d',
    พอใช้: '#ca8a04',
    ควรรีบใช้: '#ea580c',
    ใกล้หมด: '#dc2626',
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพ')
      return
    }

    setError('')
    setLoading(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)

      const base64 = dataUrl.split(',')[1]
      try {
        const res = await analyzeFreshness({
          data: { imageBase64: base64, mimeType: file.type },
        })
        setResult(res)
        onResult(res, dataUrl)
      } catch {
        setError('ไม่สามารถวิเคราะห์ภาพได้ กรุณาลองใหม่')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const color = result ? (FRESHNESS_COLOR[result.label] ?? '#6b7280') : undefined

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
        style={{
          borderColor: preview ? 'var(--lagoon)' : 'var(--line)',
          background: 'var(--surface)',
          minHeight: preview ? undefined : 160,
          overflow: 'hidden',
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="w-full rounded-2xl object-cover"
            style={{ maxHeight: 240 }}
          />
        ) : (
          <>
            <span className="text-4xl">{loading ? '⏳' : '📸'}</span>
            <p className="text-sm font-medium" style={{ color: 'var(--sea-ink)' }}>
              {loading ? 'กำลังวิเคราะห์...' : 'วางรูปหรือคลิกเพื่อเลือก'}
            </p>
            <p className="text-xs" style={{ color: 'var(--sea-ink-soft)' }}>
              AI จะวิเคราะห์ความสดของอาหารให้อัตโนมัติ
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {loading && (
        <div
          className="rounded-xl p-4 text-center island-shell border"
          style={{ borderColor: 'var(--line)' }}
        >
          <p className="text-sm animate-pulse" style={{ color: 'var(--sea-ink-soft)' }}>
            🤖 AI กำลังวิเคราะห์ความสดของอาหาร...
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {result && !loading && (
        <div
          className="island-shell rounded-xl p-4 border"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: 'var(--sea-ink)' }}>
              ผลการวิเคราะห์ AI
            </span>
            <span
              className="text-sm font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: color }}
            >
              {result.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--line)' }}>
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${result.score}%`, background: color }}
              />
            </div>
            <span className="text-sm font-bold" style={{ color }}>
              {result.score}%
            </span>
          </div>

          <p className="text-sm mb-2" style={{ color: 'var(--sea-ink-soft)' }}>
            {result.notes}
          </p>

          {result.suggestedDiscount > 0 && (
            <p className="text-xs font-medium" style={{ color: 'var(--lagoon-deep)' }}>
              💡 แนะนำลดราคา {result.suggestedDiscount}%
            </p>
          )}

          {preview && (
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                setResult(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="mt-3 text-xs underline cursor-pointer"
              style={{ color: 'var(--sea-ink-soft)' }}
            >
              เลือกรูปใหม่
            </button>
          )}
        </div>
      )}
    </div>
  )
}
