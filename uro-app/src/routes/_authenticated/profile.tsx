import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSession } from '../../server/auth'
import { getUserListings, deleteListing } from '../../server/listings'

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfilePage,
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function ProfilePage() {
  const qc = useQueryClient()

  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: () => getSession(),
  })

  const { data: listings, isLoading } = useQuery({
    queryKey: ['user-listings'],
    queryFn: () => getUserListings(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteListing({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-listings'] }),
  })

  const user = sessionData?.user

  return (
    <main className="page-wrap py-10">
      {/* Profile header */}
      <div
        className="island-shell rounded-2xl border p-6 mb-8 flex items-center gap-4"
        style={{ borderColor: 'var(--line)' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
          style={{ background: 'var(--palm)' }}
        >
          {user?.email?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--sea-ink)' }}>
            {user?.user_metadata?.full_name ?? 'ผู้ใช้งาน'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--sea-ink-soft)' }}>
            {user?.email}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--sea-ink-soft)' }}>
            สมาชิกตั้งแต่{' '}
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
              : ''}
          </p>
        </div>
      </div>

      {/* Listings */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--sea-ink)' }}>
          สินค้าของฉัน
        </h2>
        <Link
          to="/sell"
          className="px-4 py-2 rounded-xl text-sm font-medium no-underline text-white"
          style={{ background: 'var(--palm)' }}
        >
          + ลงขายใหม่
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl island-shell animate-pulse" />
          ))}
        </div>
      ) : listings && listings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="island-shell rounded-2xl border flex items-center gap-4 p-4"
              style={{ borderColor: 'var(--line)' }}
            >
              <div
                className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0"
              >
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">🥗</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-sm truncate"
                  style={{ color: 'var(--sea-ink)' }}
                >
                  {listing.title}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--sea-ink-soft)' }}>
                  ฿{listing.price.toLocaleString()} · {formatDate(listing.created_at)}
                </p>
                <span
                  className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      listing.status === 'active'
                        ? 'rgba(22,163,74,0.12)'
                        : 'rgba(107,114,128,0.12)',
                    color: listing.status === 'active' ? '#16a34a' : '#6b7280',
                  }}
                >
                  {listing.status === 'active' ? '● กำลังขาย' : listing.status}
                </span>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Link
                  to="/listings/$id"
                  params={{ id: listing.id }}
                  className="text-xs px-3 py-1.5 rounded-lg no-underline"
                  style={{
                    border: '1px solid var(--line)',
                    color: 'var(--sea-ink-soft)',
                    background: 'var(--surface)',
                  }}
                >
                  ดู
                </Link>
                <button
                  onClick={() => {
                    if (confirm('ต้องการลบสินค้านี้?')) {
                      deleteMutation.mutate(listing.id)
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="text-xs px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50"
                  style={{ border: '1px solid #fca5a5', color: '#dc2626', background: '#fef2f2' }}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16" style={{ color: 'var(--sea-ink-soft)' }}>
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium mb-4">ยังไม่มีสินค้า</p>
          <Link
            to="/sell"
            className="px-5 py-2.5 rounded-xl text-sm font-medium no-underline text-white"
            style={{ background: 'var(--palm)' }}
          >
            ลงขายสินค้าแรก
          </Link>
        </div>
      )}
    </main>
  )
}
