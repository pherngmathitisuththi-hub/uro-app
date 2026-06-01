import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { createClient } from '../../lib/supabase'

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })

    if (error) {
      setError(error.message === 'User already registered' ? 'อีเมลนี้ถูกใช้งานแล้ว' : 'เกิดข้อผิดพลาด กรุณาลองใหม่')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.navigate({ to: '/' }), 3000)
  }

  if (success) {
    return (
      <main className="page-wrap py-16 flex justify-center">
        <div
          className="island-shell rounded-2xl p-8 w-full max-w-md border text-center"
          style={{ borderColor: 'var(--line)' }}
        >
          <span className="text-5xl">📧</span>
          <h2 className="text-xl font-bold mt-4 mb-2" style={{ color: 'var(--sea-ink)' }}>
            ตรวจสอบอีเมลของคุณ
          </h2>
          <p style={{ color: 'var(--sea-ink-soft)' }}>
            เราส่งลิงก์ยืนยันไปที่ <strong>{email}</strong> แล้ว
            กรุณาตรวจสอบและคลิกลิงก์เพื่อเปิดใช้งานบัญชี
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="page-wrap py-16 flex justify-center">
      <div
        className="island-shell rounded-2xl p-8 w-full max-w-md border"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="text-center mb-8">
          <span className="text-4xl">🌱</span>
          <h1 className="display-title text-2xl font-bold mt-2" style={{ color: 'var(--sea-ink)' }}>
            สมัครสมาชิก
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--sea-ink-soft)' }}>
            ร่วมเป็นส่วนหนึ่งของชุมชนลดขยะอาหาร
          </p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: 'var(--sea-ink)' }}>
              ชื่อ-นามสกุล
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="สมชาย ใจดี"
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--sea-ink)' }}
            />
          </div>

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
              style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--sea-ink)' }}
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
              placeholder="อย่างน้อย 6 ตัวอักษร"
              minLength={6}
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--sea-ink)' }}
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
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิกฟรี'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--sea-ink-soft)' }}>
          มีบัญชีอยู่แล้ว?{' '}
          <Link to="/auth/login" className="font-medium" style={{ color: 'var(--palm)' }}>
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </main>
  )
}
