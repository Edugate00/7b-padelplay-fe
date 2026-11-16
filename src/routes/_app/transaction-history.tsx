import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Banknote, CreditCard, Download, QrCode } from 'lucide-react'

import { PageShell } from '@/components/page-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/_app/transaction-history')({
  head: () => ({ meta: [{ title: 'Transaction History · 7B Coffee POS' }] }),
  component: TransactionHistoryPage,
})

type PaymentMethod = 'Cash' | 'QRIS' | 'Card'

const TRANSACTIONS: {
  id: string
  time: string
  customer: string
  items: number
  method: PaymentMethod
  cashier: string
  total: number
  status: 'Paid' | 'Refund'
}[] = [
  {
    id: 'POS-8924',
    time: '13:12',
    customer: 'Dimas',
    items: 3,
    method: 'QRIS',
    cashier: 'Sari',
    total: 128000,
    status: 'Paid',
  },
  {
    id: 'POS-8923',
    time: '12:58',
    customer: 'Rina',
    items: 5,
    method: 'Cash',
    cashier: 'Sari',
    total: 245000,
    status: 'Paid',
  },
  {
    id: 'POS-8922',
    time: '12:41',
    customer: 'Walk-in',
    items: 1,
    method: 'Card',
    cashier: 'Budi',
    total: 58000,
    status: 'Paid',
  },
  {
    id: 'POS-8921',
    time: '12:30',
    customer: 'Adit',
    items: 2,
    method: 'QRIS',
    cashier: 'Budi',
    total: 96000,
    status: 'Paid',
  },
  {
    id: 'POS-8920',
    time: '12:05',
    customer: 'Yoga',
    items: 4,
    method: 'Cash',
    cashier: 'Sari',
    total: 174000,
    status: 'Paid',
  },
  {
    id: 'POS-8919',
    time: '11:52',
    customer: 'Maya',
    items: 2,
    method: 'QRIS',
    cashier: 'Budi',
    total: 72000,
    status: 'Refund',
  },
  {
    id: 'POS-8918',
    time: '11:30',
    customer: 'Walk-in',
    items: 1,
    method: 'Cash',
    cashier: 'Sari',
    total: 35000,
    status: 'Paid',
  },
]

const METHOD_ICON: Record<PaymentMethod, typeof Banknote> = {
  Cash: Banknote,
  QRIS: QrCode,
  Card: CreditCard,
}

function TransactionHistoryPage() {
  const [query, setQuery] = React.useState('')
  const [method, setMethod] = React.useState<'All' | PaymentMethod>('All')

  const filtered = TRANSACTIONS.filter((transaction) => {
    const matchesMethod = method === 'All' || transaction.method === method
    const matchesQuery =
      transaction.id.toLowerCase().includes(query.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(query.toLowerCase())

    return matchesMethod && matchesQuery
  })

  const totalRevenue = filtered
    .filter((transaction) => transaction.status === 'Paid')
    .reduce((sum, transaction) => sum + transaction.total, 0)

  return (
    <PageShell
      title="Transaction History"
      description="All paid transactions in this shift."
      actions={
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-xs font-semibold"
        >
          <Download className="size-4" />
          Export
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border shadow-xs">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Transactions
            </p>
            <p className="text-xl font-bold">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-xs">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Revenue
            </p>
            <p className="text-xl font-bold tabular-nums">
              Rp {totalRevenue.toLocaleString('en-US')}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-xs">
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Average / Transaction
            </p>
            <p className="text-xl font-bold tabular-nums">
              Rp{' '}
              {(filtered.length > 0
                ? Math.round(totalRevenue / filtered.length)
                : 0
              ).toLocaleString('en-US')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-xs">
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search transaction ID or customer..."
              className="h-9 max-w-sm text-sm"
            />

            <div className="flex items-center gap-1.5">
              {(['All', 'Cash', 'QRIS', 'Card'] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={method === option ? 'default' : 'outline'}
                  onClick={() => setMethod(option)}
                  className="h-8 text-xs font-semibold"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((transaction) => {
                  const Icon = METHOD_ICON[transaction.method]

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="tabular-nums text-xs font-semibold">
                        {transaction.id}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.time}
                      </TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell className="text-center">
                        {transaction.items}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <Icon className="size-3.5 text-muted-foreground" />
                          {transaction.method}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.cashier}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        Rp {transaction.total.toLocaleString('en-US')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            transaction.status === 'Paid'
                              ? 'border-primary/20 bg-primary/10 text-primary'
                              : 'border-destructive/20 bg-destructive/10 text-destructive'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No matching transactions.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
