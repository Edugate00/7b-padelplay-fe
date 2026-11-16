import { createFileRoute, Outlet } from '@tanstack/react-router'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '#/components/sidebar/app-sidebar'
import { requireAuth } from '@/lib/auth'

export const Route = createFileRoute('/_app')({
  // Validates the session against the backend before the layout renders.
  beforeLoad: requireAuth,
  component: AppLayout,
})

function AppLayout() {
  return (
    <SidebarProvider className="h-dvh min-h-0 overflow-hidden bg-muted font-sans text-foreground select-none">
      <AppSidebar />
      <Outlet />
    </SidebarProvider>
  )
}
