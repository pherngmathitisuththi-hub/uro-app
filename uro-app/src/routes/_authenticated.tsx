import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getSession } from '../server/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const { user } = await getSession()
    if (!user) {
      throw redirect({ to: '/auth/login', search: { redirect: location.href } })
    }
    return { user }
  },
  component: () => <Outlet />,
})
