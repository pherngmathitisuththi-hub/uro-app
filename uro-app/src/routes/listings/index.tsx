import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { z } from 'zod'
import { getListings } from '../../server/listings'
import ListingCard from '../../components/ListingCard'

export const Route = createFileRoute('/listings/')({
  validateSearch: z.object({
    category: z.string().optional(),
    search: z.string().optional(),
  }),
  component: ListingsPage,
})

const CATEGORIES = [
  { id: '', label: 'ทั้งหมด', emoji: '🛒' },
  { id: 'vegetables', label: 'ผัก', emoji: '🥬' },
  { id: 'fruits', label: 'ผลไม้', emoji: '🍎' },
  { id: 'dairy', label: 'นม/ไข่', emoji: '🥛' },
  { id: 'meat', label: 'เนื้อสัตว์', emoji: '🥩' },
  { id: 'bakery', label: 'เบเกอรี่', emoji: '🍞' },
  { id: 'beverages', label: 'เครื่องดื่ม', emoji: '🧃' },
  { id: 'snacks', label: 'ขนม', emoji: '🍿' },
  { id: 'other', label: 'อื่นๆ', emoji: '📦' },
]

function ListingsPage() {
  const { category, search: searchParam } = Route.useSearch()
  const navigate = Route.useNavigate()
  const [searchInput, setSearchInput] = useState(searchParam ?? '')

  const { data: listings, isLoading } = useQuery({
    queryKey: ['listings', category, searchParam],
    queryFn: () =>
      getListings({ data: { category: category || undefined, search: searchParam || undefined } }),
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({ search: (prev) => ({ ...prev, search: searchInput || undefined }) })
  }

  return (
    <main className="page-wrap py-10">
      <h1 className="display-title text-3xl font-bold mb-6" style={{ color: 'var(--sea-ink)' }}>
        เรียกดูสินค้า
      </h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="ค้นหาสินค้า..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--sea-ink)' }}
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer"
          style={{ background: 'var(--palm)' }}
        >
          ค้นหา
        </button>
      </form>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((c) => {
          const isActive = (category ?? '') === c.id
          return (
            <button
              key={c.id}
              onClick={() =>
                navigate({ search: (prev) => ({ ...prev, category: c.id || undefined }) })
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all"
              style={{
                background: isActive ? 'var(--palm)' : 'var(--chip-bg)',
                border: `1px solid ${isActive ? 'transparent' : 'var(--chip-line)'}`,
                color: isActive ? 'white' : 'var(--sea-ink)',
              }}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl island-shell animate-pulse h-64" />
          ))}
        </div>
      ) : listings && listings.length > 0 ? (
        <>
          <p className="text-sm mb-4" style={{ color: 'var(--sea-ink-soft)' }}>
            พบ {listings.length} รายการ
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20" style={{ color: 'var(--sea-ink-soft)' }}>
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-medium">ไม่พบสินค้าที่ค้นหา</p>
        </div>
      )}
    </main>
  )
}
