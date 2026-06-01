import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { createListing } from '../../server/listings'
import FreshnessAnalyzer from '../../components/FreshnessAnalyzer'
import type { FreshnessResult } from '../../server/gemini'

export const Route = createFileRoute('/_authenticated/sell')({
  component: SellPage,
})

const CATEGORIES = [
  { id: 'vegetables', label: '🥬 ผัก' },
  { id: 'fruits', label: '🍎 ผลไม้' },
  { id: 'dairy', label: '🥛 นม/ไข่' },
  { id: 'meat', label: '🥩 เนื้อสัตว์' },
  { id: 'bakery', label: '🍞 เบเกอรี่' },
  { id: 'beverages', label: '🧃 เครื่องดื่ม' },
  { id: 'snacks', label: '🍿 ขนม' },
  { id: 'other', label: '📦 อื่นๆ' },
]

function SellPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [category, setCategory] = useState('vegetables')
  const [expiryDate, setExpiryDate] = useState('')
  const [location, setLocation] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [freshness, setFreshness] = useState<FreshnessResult | null>(null)

  const handleFreshnessResult = (result: FreshnessResult, dataUrl: string) => {
    setFreshness(result)
    setImageUrl(dataUrl)
    if (result.suggestedDiscount > 0 && originalPrice) {
      const suggested = Math.round(
        parseFloat(originalPrice) * (1 - result.suggestedDiscount / 100),
      )
      setPrice(String(suggested))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const listing = await createListing({
        data: {
          title,
          description: description || undefined,
          price: parseFloat(price),
          original_price: originalPrice ? parseFloat(originalPrice) : undefined,
          category,
          expiry_date: expiryDate || undefined,
          location: location || undefined,
          images: imageUrl ? [imageUrl] : [],
          freshness_score: freshness?.score,
          freshness_notes: freshness?.notes,
        },
      })
      router.navigate({ to: '/listings/$id', params: { id: listing.id } })
    } catch (err: any) {
      setError(err?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่')
      setLoading(false)
    }
  }

  return (
    <main className="page-wrap py-10">
      <h1 className="display-title text-3xl font-bold mb-2" style={{ color: 'var(--sea-ink)' }}>
        ลงขายสินค้า
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--sea-ink-soft)' }}>
        ถ่ายรูปสินค้าแล้วให้ AI วิเคราะห์ความสดให้อัตโนมัติ
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Freshness Analyzer */}
        <div>
          <h2 className="font-semibold mb-3" style={{ color: 'var(--sea-ink)' }}>
            📸 วิเคราะห์ความสด (AI)
          </h2>
          <FreshnessAnalyzer onResult={handleFreshnessResult} />
        </div>

        {/* Right: Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--sea-ink)' }}>
              ชื่อสินค้า *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น มะม่วงน้ำดอกไม้สุก 1 กก."
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--sea-ink)' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--sea-ink)' }}>
              หมวดหมู่ *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
              style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--sea-ink)' }}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--sea-ink)' }}>
                ราคาขาย (บาท) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--sea-ink)' }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--sea-ink)' }}>
                ราคาเดิม (ถ้ามี)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--sea-ink)' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--sea-ink)' }}>
                วันหมดอายุ
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--sea-ink)' }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: 'var(--sea-ink)' }}>
                ที่อยู่/ย่าน
              </label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="เช่น สาทร กรุงเทพฯ"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--sea-ink)' }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--sea-ink)' }}>
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="บอกรายละเอียดสินค้า เงื่อนไขการขาย วิธีรับของ..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
              style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--sea-ink)' }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white cursor-pointer disabled:opacity-60 mt-2"
            style={{ background: 'var(--palm)' }}
          >
            {loading ? 'กำลังลงขาย...' : '✅ ลงขายสินค้า'}
          </button>
        </form>
      </div>
    </main>
  )
}
