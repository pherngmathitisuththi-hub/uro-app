import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { createClient } from '../../lib/supabase'

export const Route = createFileRoute('/auth/login')({
  validateSearch: z.object({ redirect: z.string().optional() }),
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const { redirect } = Route.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      setLoading(false)
      return
    }
    router.invalidate()
    router.navigate({ to: redirect ?? '/' })
  }

  return (
    <main className="page-wrap py-16 flex justify-center">
      <div
        className="island-shell rounded-2xl p-8 w-full max-w-md border"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="text-center mb-8">
          <span className="text-4xl">🌿</span>
          <h1 className="display-title text-2xl font-bold mt-2" style={{ color: 'var(--sea-ink)' }}>
            เข้าสู่ระบบ
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--sea-ink-soft)' }}>
            ยินดีต้อนรับกลับมา
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--sea-ink)' }}>
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                color: 'var(--sea-ink)',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--sea-ink)' }}>
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                color: 'var(--sea-ink)',
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-white cursor-pointer disabled:opacity-60"
            style={{ background: 'var(--palm)' }}
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--sea-ink-soft)' }}>
          ยังไม่มีบัญชี?{' '}
          <Link to="/auth/register" className="font-medium" style={{ color: 'var(--palm)' }}>
            สมัครสมาชิกฟรี
          </Link>
        </p>
      </div>
    </main>
  )
}
