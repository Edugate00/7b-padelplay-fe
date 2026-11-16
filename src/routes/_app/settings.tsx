import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Save, Store } from 'lucide-react'

import { PageShell } from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/_app/settings')({
  head: () => ({ meta: [{ title: 'Settings · 7B Coffee POS' }] }),
  component: SettingsPage,
})

const TOGGLES = [
  {
    id: 'auto-print',
    label: 'Automatic receipt printing',
    description: 'Print a receipt for every successfully paid transaction.',
    defaultChecked: true,
  },
  {
    id: 'service-charge',
    label: 'Service charge 5%',
    description: 'Add a service charge to every bill.',
    defaultChecked: false,
  },
  {
    id: 'sound',
    label: 'Notification sound',
    description: 'Play a sound when a new order comes in.',
    defaultChecked: true,
  },
]

function SettingsPage() {
  const [storeName, setStoreName] = React.useState('7B Coffee Senopati')
  const [phone, setPhone] = React.useState('021-555-7788')
  const [address, setAddress] = React.useState(
    'Senopati St. No. 7B, Kebayoran Baru, South Jakarta',
  )
  const [tax, setTax] = React.useState('10')
  const [receiptFooter, setReceiptFooter] = React.useState(
    'Thank you for visiting 7B Coffee!',
  )

  const handleSave = () => {
    alert('Settings saved successfully.')
  }

  return (
    <PageShell
      title="Settings"
      description="Manage store information, tax, and terminal preferences."
      actions={
        <Button
          size="sm"
          className="h-9 gap-1.5 text-xs font-semibold"
          onClick={handleSave}
        >
          <Save className="size-4" />
          Save
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Store className="size-4" />
              </span>
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="store-name">Store name</Label>
              <Input
                id="store-name"
                value={storeName}
                onChange={(event) => setStoreName(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="store-phone">Phone number</Label>
              <Input
                id="store-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="store-address">Address</Label>
              <Input
                id="store-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Tax &amp; Receipt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tax">Tax (%)</Label>
                <Input
                  id="tax"
                  type="number"
                  min={0}
                  max={100}
                  value={tax}
                  onChange={(event) => setTax(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" value="IDR (Rp)" disabled />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="receipt-footer">Receipt note</Label>
              <Input
                id="receipt-footer"
                value={receiptFooter}
                onChange={(event) => setReceiptFooter(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Terminal Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {TOGGLES.map((toggle, index) => (
              <React.Fragment key={toggle.id}>
                {index > 0 ? <Separator className="my-1" /> : null}
                <label
                  htmlFor={toggle.id}
                  className="flex cursor-pointer items-start justify-between gap-4 rounded-lg p-2 hover:bg-muted/60"
                >
                  <span>
                    <span className="block text-sm font-medium">
                      {toggle.label}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {toggle.description}
                    </span>
                  </span>
                  <input
                    id={toggle.id}
                    type="checkbox"
                    defaultChecked={toggle.defaultChecked}
                    className="mt-1 size-4 accent-primary"
                  />
                </label>
              </React.Fragment>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  )
}
