import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Armchair, Clock, Coffee, ReceiptText, Users } from 'lucide-react'

import { PageShell } from '@/components/page-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_app/table-orders')({
  head: () => ({ meta: [{ title: 'Table Orders · 7B Coffee POS' }] }),
  component: TableOrdersPage,
})

type TableStatus = 'occupied' | 'available' | 'reserved'

const TABLES: {
  id: string
  status: TableStatus
  guests: number
  total: number
  since: string
  customer?: string
}[] = [
  {
    id: '01',
    status: 'occupied',
    guests: 2,
    total: 128000,
    since: '12:10',
    customer: 'Dimas',
  },
  { id: '02', status: 'available', guests: 0, total: 0, since: '-' },
  {
    id: '03',
    status: 'occupied',
    guests: 4,
    total: 245000,
    since: '12:25',
    customer: 'Rina',
  },
  {
    id: '04',
    status: 'reserved',
    guests: 3,
    total: 0,
    since: '13:00',
    customer: 'Bagas',
  },
  { id: '05', status: 'available', guests: 0, total: 0, since: '-' },
  {
    id: '06',
    status: 'occupied',
    guests: 1,
    total: 58000,
    since: '12:40',
    customer: 'Sari',
  },
  { id: '07', status: 'available', guests: 0, total: 0, since: '-' },
  {
    id: '08',
    status: 'occupied',
    guests: 2,
    total: 96000,
    since: '12:55',
    customer: 'Adit',
  },
  { id: '09', status: 'available', guests: 0, total: 0, since: '-' },
  {
    id: '10',
    status: 'reserved',
    guests: 6,
    total: 0,
    since: '13:30',
    customer: 'Putri Family',
  },
  { id: '11', status: 'available', guests: 0, total: 0, since: '-' },
  {
    id: '12',
    status: 'occupied',
    guests: 3,
    total: 174000,
    since: '13:05',
    customer: 'Yoga',
  },
]

const STATUS_LABEL: Record<TableStatus, string> = {
  occupied: 'Occupied',
  available: 'Available',
  reserved: 'Reserved',
}

const STATUS_CLASS: Record<TableStatus, string> = {
  occupied: 'bg-primary/10 text-primary border-primary/20',
  available: 'bg-muted text-muted-foreground border-border',
  reserved: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
}

function TableOrdersPage() {
  const [selectedTable, setSelectedTable] = React.useState('01')

  const occupied = TABLES.filter((table) => table.status === 'occupied')
  const available = TABLES.filter((table) => table.status === 'available')
  const reserved = TABLES.filter((table) => table.status === 'reserved')
  const activeTable = TABLES.find((table) => table.id === selectedTable)

  const summary = [
    {
      label: 'Occupied Tables',
      value: occupied.length,
      icon: Armchair,
      hint: `${occupied.reduce((sum, table) => sum + table.guests, 0)} guests`,
    },
    {
      label: 'Available Tables',
      value: available.length,
      icon: Coffee,
      hint: 'Ready to use',
    },
    {
      label: 'Reservations',
      value: reserved.length,
      icon: Clock,
      hint: 'Awaiting arrival',
    },
    {
      label: 'Total Guests',
      value: TABLES.reduce((sum, table) => sum + table.guests, 0),
      icon: Users,
      hint: 'Today',
    },
  ]

  return (
    <PageShell
      title="Table Orders"
      description="Monitor table status and active orders."
      actions={
        <Button size="sm" className="h-9 gap-1.5 text-xs font-semibold">
          <ReceiptText className="size-4" />
          New Order
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label} className="border-border shadow-xs">
            <CardContent className="flex items-center gap-3 p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground/80">
                <item.icon className="size-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-xl font-bold leading-tight">{item.value}</p>
                <p className="text-[11px] text-muted-foreground">{item.hint}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Table Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {TABLES.map((table) => {
                const isActive = table.id === selectedTable

                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => setSelectedTable(table.id)}
                    className={`flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors ${
                      isActive
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border bg-card hover:bg-muted/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">
                        Table {table.id}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${STATUS_CLASS[table.status]}`}
                      >
                        {STATUS_LABEL[table.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        {table.guests}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {table.since}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-foreground/80">
                      {table.total > 0
                        ? `Rp ${table.total.toLocaleString('en-US')}`
                        : 'No orders yet'}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit border-border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Table Details for {selectedTable}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {activeTable ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant="outline"
                    className={STATUS_CLASS[activeTable.status]}
                  >
                    {STATUS_LABEL[activeTable.status]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">
                    {activeTable.customer ?? '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Guest count</span>
                  <span className="font-medium">
                    {activeTable.guests} people
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Started</span>
                  <span className="font-medium">{activeTable.since}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Total</span>
                  <span className="tabular-nums font-bold">
                    Rp {activeTable.total.toLocaleString('en-US')}
                  </span>
                </div>
                <Button
                  className="w-full"
                  size="sm"
                  disabled={activeTable.status === 'available'}
                >
                  View Order
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">Table not found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
