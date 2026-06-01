import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getListings } from '../server/listings'
import ListingCard from '../components/ListingCard'

export const Route = createFileRoute('/')({
  component: Home,
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

function Home() {
  const { data: listings, isLoading } = useQuery({
    queryKey: ['listings', 'recent'],
    queryFn: () => getListings({ data: { limit: 12 } }),
  })

  return (
    <main className="page-wrap py-10">
      {/* Hero */}
      <section className="text-center mb-12 rise-in">
        <span className="island-kicker mb-4 inline-block">ตลาดอาหารใกล้หมดอายุ</span>
        <h1 className="display-title text-5xl font-bold mb-4" style={{ color: 'var(--sea-ink)' }}>
          ลดราคา ลดขยะ<br />ช่วยโลกด้วยกัน 🌱
        </h1>
        <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--sea-ink-soft)' }}>
          ซื้อ-ขายอาหารคุณภาพดีในราคาพิเศษ ก่อนวันหมดอายุ ใช้ AI วิเคราะห์ความสดใหม่
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/listings"
            className="px-6 py-3 rounded-xl font-semibold no-underline text-white"
            style={{ background: 'var(--palm)' }}
          >
            เรียกดูสินค้า
          </Link>
          <Link
            to="/sell"
            className="px-6 py-3 rounded-xl font-semibold no-underline island-shell"
            style={{ color: 'var(--sea-ink)' }}
          >
            ลงขายสินค้า
          </Link>
        </div>
      </section>

      {/* Category pills */}
      <section className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/listings"
              search={{ category: c.id || undefined }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium no-underline transition-all"
              style={{
                background: 'var(--chip-bg)',
                border: '1px solid var(--chip-line)',
                color: 'var(--sea-ink)',
              }}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent listings */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--sea-ink)' }}>
            สินค้าล่าสุด
          </h2>
          <Link to="/listings" className="text-sm font-medium" style={{ color: 'var(--lagoon-deep)' }}>
            ดูทั้งหมด →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl island-shell animate-pulse h-64" />
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16" style={{ color: 'var(--sea-ink-soft)' }}>
            <p className="text-4xl mb-3">🌿</p>
            <p className="font-medium">ยังไม่มีสินค้า เป็นคนแรกที่ลงขาย!</p>
            <Link to="/sell" className="mt-4 inline-block px-4 py-2 rounded-lg font-medium no-underline text-white" style={{ background: 'var(--palm)' }}>
              ลงขายเลย
            </Link>
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--sea-ink)' }}>
          ใช้งานง่าย 3 ขั้นตอน
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '1', emoji: '📸', title: 'ถ่ายรูปสินค้า', desc: 'ถ่ายรูปอาหารที่ต้องการขาย ระบบ AI จะวิเคราะห์ความสดอัตโนมัติ' },
            { step: '2', emoji: '🏷️', title: 'กำหนดราคา', desc: 'ตั้งราคาที่ต้องการ ระบบช่วยแนะนำราคาที่เหมาะสมตามความสด' },
            { step: '3', emoji: '🤝', title: 'รอผู้ซื้อ', desc: 'ผู้ซื้อจะติดต่อมาโดยตรง นัดรับของและรับเงินได้เลย' },
          ].map((item) => (
            <div
              key={item.step}
              className="island-shell rounded-2xl p-6 text-center border"
              style={{ borderColor: 'var(--line)' }}
            >
              <div className="text-4xl mb-3">{item.emoji}</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--sea-ink)' }}>
                {item.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--sea-ink-soft)' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
