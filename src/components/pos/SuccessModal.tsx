import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import {
  CheckCircle2,
  Printer,
  Share2,
  PlusCircle,
} from 'lucide-react'
import type { CartItem } from '@/data/posData'

interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  paymentInfo: {
    method: string
    amountPaid: number
    change: number
  } | null
  orderType: 'Dine In' | 'Take Away'
  tableNumber: string
  onNewTransaction: () => void
}

export function SuccessModal({
  open,
  onOpenChange,
  items,
  subtotal,
  tax,
  total,
  paymentInfo,
  orderType,
  tableNumber,
  onNewTransaction,
}: SuccessModalProps) {
  const transactionId = React.useMemo(
    () => `TRX-7B-${Math.floor(100000 + Math.random() * 900000)}`,
    [open]
  )

  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border border-border">
        <DialogClose onClick={() => onOpenChange(false)} />

        {/* Header */}
        <div className="bg-primary text-primary-foreground p-6 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-primary-foreground tracking-tight">
              Pembayaran Berhasil!
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/70 text-xs mt-1">
              Pesanan telah dicatat dan struk siap dicetak.
            </DialogDescription>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <Card className="bg-muted/60 border-border p-4 font-mono text-xs space-y-3 shadow-none">
            <div className="text-center pb-2 border-b border-dashed border-input font-sans">
              <h4 className="font-bold text-sm text-foreground">7B COFFEE SENOPATI</h4>
              <p className="text-[11px] text-muted-foreground">Jl. Senopati No. 7B, Kebayoran Baru, Jakarta</p>
            </div>

            <div className="space-y-1 text-muted-foreground text-[11px]">
              <div className="flex justify-between">
                <span>No. TRX:</span>
                <span className="font-bold text-foreground">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{currentDate} WIB</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>Dimas Satrio (POS-01)</span>
              </div>
              <div className="flex justify-between">
                <span>Tipe:</span>
                <span className="font-semibold text-foreground">
                  {orderType} {tableNumber ? `(Meja ${tableNumber})` : ''}
                </span>
              </div>
            </div>

            <Separator className="bg-border border-dashed" />

            {/* Items */}
            <div className="space-y-2 py-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-foreground/90">
                  <div>
                    <span className="font-bold">{item.quantity}x {item.name}</span>
                    <p className="text-[10px] text-muted-foreground font-sans">
                      {[item.size, item.temperature].filter(Boolean).join(' / ')}
                    </p>
                  </div>
                  <span className="font-bold">
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="bg-border border-dashed" />

            {/* Calculations */}
            <div className="space-y-1 text-[11px] text-foreground/80">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>PB1 Restoran (10%):</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground text-xs pt-1 border-t border-input">
                <span>TOTAL:</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-muted-foreground pt-1">
                <span>Metode:</span>
                <span className="uppercase font-semibold text-foreground">
                  {paymentInfo?.method || 'CASH'}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Diterima:</span>
                <span>Rp {(paymentInfo?.amountPaid || total).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-foreground font-bold">
                <span>Kembalian:</span>
                <span>Rp {(paymentInfo?.change || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-muted/60 border-t border-border space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs font-semibold gap-1.5 border-input text-foreground/80 hover:bg-muted"
              onClick={() => alert('Mengirim perintah cetak ke thermal printer EPSON TM-T82...')}
            >
              <Printer className="w-4 h-4 text-muted-foreground" />
              <span>Cetak Struk (F9)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs font-semibold gap-1.5 border-input text-foreground/80 hover:bg-muted"
              onClick={() => alert('Struk digital dikirim via WhatsApp')}
            >
              <Share2 className="w-4 h-4 text-muted-foreground" />
              <span>Kirim WA</span>
            </Button>
          </div>

          <Button
            onClick={() => {
              onNewTransaction()
              onOpenChange(false)
            }}
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold h-11 rounded-xl shadow-md gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Transaksi Baru (F10)</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
