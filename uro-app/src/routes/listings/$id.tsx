import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getListing } from '../../server/listings'

export const Route = createFileRoute('/listings/$id')({
  component: ListingDetailPage,
})

const FRESHNESS_LABEL: Record<number, { label: string; color: string }> = {
  5: { label: 'สดมาก', color: '#16a34a' },
  4: { label: 'ดี', color: '#65a30d' },
  3: { label: 'พอใช้', color: '#ca8a04' },
  2: { label: 'ควรรีบใช้', color: '#ea580c' },
  1: { label: 'ใกล้หมด', color: '#dc2626' },
}

function getFreshnessLevel(score: number) {
  if (score >= 80) return FRESHNESS_LABEL[5]
  if (score >= 60) return FRESHNESS_LABEL[4]
  if (score >= 40) return FRESHNESS_LABEL[3]
  if (score >= 20) return FRESHNESS_LABEL[2]
  return FRESHNESS_LABEL[1]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function ListingDetailPage() {
  const { id } = Route.useParams()

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing({ data: { id } }),
  })

  if (isLoading) {
    return (
      <main className="page-wrap py-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl island-shell animate-pulse h-80" />
          <div className="space-y-4">
            <div className="h-8 rounded-xl island-shell animate-pulse" />
            <div className="h-4 rounded-lg island-shell animate-pulse w-1/2" />
            <div className="h-20 rounded-xl island-shell animate-pulse" />
          </div>
        </div>
      </main>
    )
  }

  if (isError || !listing) {
    return (
      <main className="page-wrap py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="font-medium text-lg mb-4" style={{ color: 'var(--sea-ink)' }}>
          ไม่พบสินค้านี้
        </p>
        <Link to="/listings" className="text-sm" style={{ color: 'var(--lagoon-deep)' }}>
          ← กลับไปเรียกดูสินค้า
        </Link>
      </main>
    )
  }

  const freshness = listing.freshness_score != null ? getFreshnessLevel(listing.freshness_score) : null
  const discount =
    listing.original_price && listing.original_price > listing.price
      ? Math.round(((listing.original_price - listing.price) / listing.original_price) * 100)
      : null

  return (
    <main className="page-wrap py-10">
      <Link to="/listings" className="text-sm mb-6 inline-block" style={{ color: 'var(--sea-ink-soft)' }}>
        ← กลับไปเรียกดูสินค้า
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div
          className="rounded-2xl overflow-hidden island-shell border flex items-center justify-center"
          style={{ borderColor: 'var(--line)', minHeight: 320 }}
        >
          {listing.images?.[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
              style={{ maxHeight: 400 }}
            />
          ) : (
            <span className="text-8xl">🥗</span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <span
              className="island-kicker text-xs"
              style={{ color: 'var(--kicker)' }}
            >
              {listing.category}
            </span>
            <h1 className="display-title text-3xl font-bold mt-1" style={{ color: 'var(--sea-ink)' }}>
              {listing.title}
            </h1>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold" style={{ color: 'var(--palm)' }}>
              ฿{listing.price.toLocaleString()}
            </span>
            {listing.original_price && (
              <span className="text-lg line-through" style={{ color: 'var(--sea-ink-soft)' }}>
                ฿{listing.original_price.toLocaleString()}
              </span>
            )}
            {discount && (
              <span className="px-2 py-0.5 rounded-full text-sm font-bold text-white" style={{ background: '#dc2626' }}>
                -{discount}%
              </span>
            )}
          </div>

          {/* Freshness */}
          {freshness && listing.freshness_score != null && (
            <div
              className="island-shell rounded-xl p-4 border"
              style={{ borderColor: 'var(--line)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--sea-ink)' }}>
                  ความสด (AI วิเคราะห์)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--line)' }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${listing.freshness_score}%`, background: freshness.color }}
                  />
                </div>
                <span className="text-sm font-bold" style={{ color: freshness.color }}>
                  {listing.freshness_score}% — {freshness.label}
                </span>
              </div>
              {listing.freshness_notes && (
                <p className="text-xs mt-2" style={{ color: 'var(--sea-ink-soft)' }}>
                  {listing.freshness_notes}
                </p>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-sm" style={{ color: 'var(--sea-ink-soft)' }}>
            {listing.expiry_date && (
              <span className="flex items-center gap-1">
                📅 หมดอายุ {formatDate(listing.expiry_date)}
              </span>
            )}
            {listing.location && (
              <span className="flex items-center gap-1">📍 {listing.location}</span>
            )}
            <span className="flex items-center gap-1">
              🕐 ลงขาย {formatDate(listing.created_at)}
            </span>
          </div>

          {/* Description */}
          {listing.description && (
            <div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--sea-ink)' }}>รายละเอียด</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--sea-ink-soft)' }}>
                {listing.description}
              </p>
            </div>
          )}

          {/* Seller */}
          <div
            className="island-shell rounded-xl p-4 border mt-auto"
            style={{ borderColor: 'var(--line)' }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--sea-ink)' }}>
              ผู้ขาย
            </p>
            <p style={{ color: 'var(--sea-ink-soft)' }}>
              {(listing.profiles as any)?.full_name ||
                (listing.profiles as any)?.username ||
                'ผู้ใช้งาน'}
            </p>
            {(listing.profiles as any)?.phone && (
              <a
                href={`tel:${(listing.profiles as any).phone}`}
                className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold no-underline text-white"
                style={{ background: 'var(--palm)' }}
              >
                📞 ติดต่อผู้ขาย
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
