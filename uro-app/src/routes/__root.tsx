import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useQuery } from '@tanstack/react-query'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'
import appCss from '../styles.css?url'

import { createClient } from '../lib/supabase'
import { signOut } from '../server/auth'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'FoodRescue — ตลาดอาหารใกล้หมดอายุ' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <Navbar />
      <Outlet />
      <footer className="site-footer mt-16 py-8 text-center text-sm text-[var(--sea-ink-soft)]">
        <div className="page-wrap">
          <p>© 2025 FoodRescue — ลดขยะอาหาร ช่วยโลก ประหยัดเงิน</p>
        </div>
      </footer>
    </>
  )
}

function Navbar() {
  const router = useRouter()
  const supabase = createClient()

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession()
      return data.session
    },
  })

  const handleSignOut = async () => {
    await signOut()
    await supabase.auth.signOut()
    router.invalidate()
  }

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{ background: 'var(--header-bg)', borderColor: 'var(--line)' }}
    >
      <nav className="page-wrap flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg no-underline" style={{ color: 'var(--palm)' }}>
          <span className="text-2xl">🌿</span>
          <span className="display-title">FoodRescue</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/listings" className="nav-link text-sm font-medium">
            เรียกดูสินค้า
          </Link>
          {session && (
            <Link to="/sell" className="nav-link text-sm font-medium">
              ลงขาย
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                to="/profile"
                className="text-sm font-medium px-3 py-1.5 rounded-lg no-underline"
                style={{ background: 'var(--surface)', color: 'var(--sea-ink)', border: '1px solid var(--line)' }}
              >
                โปรไฟล์
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium px-3 py-1.5 rounded-lg cursor-pointer"
                style={{ background: 'transparent', color: 'var(--sea-ink-soft)', border: '1px solid var(--line)' }}
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="text-sm font-medium px-3 py-1.5 rounded-lg no-underline"
                style={{ color: 'var(--sea-ink-soft)', border: '1px solid var(--line)', background: 'var(--surface)' }}
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                to="/auth/register"
                className="text-sm font-medium px-4 py-1.5 rounded-lg no-underline text-white"
                style={{ background: 'var(--palm)' }}
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            { name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
