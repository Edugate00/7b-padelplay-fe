import * as React from 'react'
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '#/components/sidebar/app-sidebar'
import { getAuthToken } from '@/lib/axios'

export const Route = createFileRoute('/_app')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !getAuthToken()) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  const navigate = useNavigate()

  React.useEffect(() => {
    if (getAuthToken()) {
      // setIsAuthorized(true)
      return
    }

    void navigate({ to: '/login', replace: true })
  }, [navigate])

  return (
    <SidebarProvider className="h-dvh min-h-0 overflow-hidden bg-muted font-sans text-foreground select-none">
      <AppSidebar />
      <Outlet />
    </SidebarProvider>
  )
}
