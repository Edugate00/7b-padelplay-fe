import * as React from 'react'

import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'

export function PageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <SidebarInset className="h-full min-w-0 overflow-hidden">
      <header className="z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3 shadow-xs sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground">
              {title}
            </h1>
            {description ? (
              <p className="truncate text-[11px] text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </header>

      <div className="flex-1 overflow-y-auto bg-muted/60 p-4 sm:p-5">
        <div className="mx-auto w-full max-w-7xl space-y-5">{children}</div>
      </div>
    </SidebarInset>
  )
}
