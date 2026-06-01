import { Link } from '@tanstack/react-router'
import type { Listing } from '../server/listings'

function getFreshnessColor(score: number) {
  if (score >= 80) return '#16a34a'
  if (score >= 60) return '#65a30d'
  if (score >= 40) return '#ca8a04'
  if (score >= 20) return '#ea580c'
  return '#dc2626'
}

function getDaysLeft(expiryDate: string) {
  const diff = Math.ceil(
    (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  )
  return diff
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const discount =
    listing.original_price && listing.original_price > listing.price
      ? Math.round(((listing.original_price - listing.price) / listing.original_price) * 100)
      : null

  const daysLeft = listing.expiry_date ? getDaysLeft(listing.expiry_date) : null

  return (
    <Link
      to="/listings/$id"
      params={{ id: listing.id }}
      className="no-underline group"
    >
      <article
        className="island-shell feature-card rounded-2xl border overflow-hidden flex flex-col h-full transition-all"
        style={{ borderColor: 'var(--line)' }}
      >
        {/* Image */}
        <div
          className="relative overflow-hidden bg-gray-100 flex items-center justify-center"
          style={{ height: 160 }}
        >
          {listing.images?.[0] ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-5xl">🥗</span>
          )}

          {discount && (
            <span
              className="absolute top-2 right-2 text-xs font-bold text-white px-2 py-0.5 rounded-full"
              style={{ background: '#dc2626' }}
            >
              -{discount}%
            </span>
          )}

          {daysLeft !== null && daysLeft <= 3 && (
            <span
              className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: daysLeft <= 0 ? '#dc2626' : '#ea580c',
                color: 'white',
              }}
            >
              {daysLeft <= 0 ? 'หมดอายุแล้ว' : `เหลือ ${daysLeft} วัน`}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5 p-3 flex-1">
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{ color: 'var(--kicker)' }}
          >
            {listing.category}
          </p>

          <h3
            className="font-semibold text-sm leading-snug line-clamp-2"
            style={{ color: 'var(--sea-ink)' }}
          >
            {listing.title}
          </h3>

          {/* Freshness bar */}
          {listing.freshness_score != null && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--line)' }}>
                <div
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${listing.freshness_score}%`,
                    background: getFreshnessColor(listing.freshness_score),
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: 'var(--sea-ink-soft)' }}>
                {listing.freshness_score}%
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto pt-2">
            <span className="text-base font-bold" style={{ color: 'var(--palm)' }}>
              ฿{listing.price.toLocaleString()}
            </span>
            {listing.original_price && (
              <span className="text-xs line-through" style={{ color: 'var(--sea-ink-soft)' }}>
                ฿{listing.original_price.toLocaleString()}
              </span>
            )}
          </div>

          {listing.location && (
            <p className="text-xs" style={{ color: 'var(--sea-ink-soft)' }}>
              📍 {listing.location}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
