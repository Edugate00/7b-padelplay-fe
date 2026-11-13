import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import {
  QrCode,
  Banknote,
  CreditCard,
  Building2,
  CheckCircle2,
  Receipt,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react'
import type { CartItem } from '@/data/posData'

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  orderType: 'Dine In' | 'Take Away'
  tableNumber: string
  customerName: string
  onPaymentSuccess: (paymentInfo: {
    method: string
    amountPaid: number
    change: number
  }) => void
}

export function CheckoutModal({
  open,
  onOpenChange,
  items,
  subtotal,
  tax,
  total,
  customerName,
  onPaymentSuccess,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = React.useState('cash')
  const [cashGiven, setCashGiven] = React.useState<number>(total)
  const [showItemsDetail, setShowItemsDetail] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [approvalCode, setApprovalCode] = React.useState('')

  // Sync cash given when total changes
  React.useEffect(() => {
    setCashGiven(total)
  }, [total, open])

  const change = Math.max(0, cashGiven - total)
  const isCashInsufficient = paymentMethod === 'cash' && cashGiven < total

  const handlePay = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onPaymentSuccess({
        method: paymentMethod.toUpperCase(),
        amountPaid: paymentMethod === 'cash' ? cashGiven : total,
        change: paymentMethod === 'cash' ? change : 0,
      })
      onOpenChange(false)
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border border-border">
        <DialogClose onClick={() => onOpenChange(false)} />

        {/* Modal Header */}
        <DialogHeader className="bg-primary text-primary-foreground p-6 border-b-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold text-primary-foreground tracking-tight">
                  Konfirmasi & Pembayaran
                </DialogTitle>
              </div>
              <DialogDescription className="text-primary-foreground/70 text-xs">
                {customerName ? `a/n ${customerName}` : ''}
              </DialogDescription>
            </div>

            {/* Total Highlight */}
            <div className="text-right">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70 block">
                Total Tagihan
              </span>
              <span className="text-2xl font-black font-mono text-primary-foreground tracking-tight">
                Rp {total.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[68vh] overflow-y-auto">
          {/* Collapsible Order Summary Bar */}
          <div className="rounded-xl border border-border bg-muted/60 p-3.5 transition-all">
            <button
              type="button"
              onClick={() => setShowItemsDetail(!showItemsDetail)}
              className="w-full flex items-center justify-between text-xs font-semibold text-foreground/90 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-muted-foreground" />
                <span>Rincian Pesanan ({items.reduce((s, i) => s + i.quantity, 0)} Item)</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <span>{showItemsDetail ? 'Tutup Rincian' : 'Lihat Rincian'}</span>
                {showItemsDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {showItemsDetail && (
              <div className="mt-3 pt-3 border-t border-border space-y-2 text-xs">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-foreground">{item.quantity}x {item.name}</span>
                      <span className="text-muted-foreground text-[11px] ml-1.5">
                        ({[item.size, item.temperature].filter(Boolean).join(' / ')})
                      </span>
                    </div>
                    <span className="font-mono text-foreground/80">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Subtotal: Rp {subtotal.toLocaleString('id-ID')}</span>
                  <span>PB1 (10%): Rp {tax.toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector via Shadcn Tabs */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Pilih Metode Pembayaran
            </label>

            <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
              <TabsList className="grid grid-cols-4 h-12 bg-muted p-1 rounded-xl">
                <TabsTrigger value="cash" className="gap-1.5 text-xs">
                  <Banknote className="w-4 h-4" />
                  <span>Tunai</span>
                </TabsTrigger>
                <TabsTrigger value="qris" className="gap-1.5 text-xs">
                  <QrCode className="w-4 h-4" />
                  <span>QRIS</span>
                </TabsTrigger>
                <TabsTrigger value="edc" className="gap-1.5 text-xs">
                  <CreditCard className="w-4 h-4" />
                  <span>Kartu EDC</span>
                </TabsTrigger>
                <TabsTrigger value="transfer" className="gap-1.5 text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>Transfer</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: TUNAI (CASH) */}
              <TabsContent value="cash" className="space-y-4 pt-2">
                <Card className="p-4 border-border space-y-3 bg-card shadow-xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground/80">
                      Uang Diterima dari Pelanggan
                    </label>
                    <span className="text-xs text-muted-foreground">
                      Tagihan: <strong className="text-foreground font-mono">Rp {total.toLocaleString('id-ID')}</strong>
                    </span>
                  </div>

                  {/* Input nominal */}
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-sm text-muted-foreground/70">Rp</span>
                    <Input
                      type="number"
                      value={cashGiven || ''}
                      onChange={(e) => setCashGiven(Number(e.target.value) || 0)}
                      className="pl-11 h-11 text-lg font-bold font-mono text-foreground focus-visible:ring-ring"
                      placeholder="0"
                    />
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[
                      { label: 'Uang Pas', value: total },
                      { label: 'Rp 80.000', value: 80000 },
                      { label: 'Rp 100.000', value: 100000 },
                      { label: 'Rp 200.000', value: 200000 },
                    ].map((btn) => (
                      <Button
                        key={btn.label}
                        type="button"
                        variant={cashGiven === btn.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCashGiven(btn.value)}
                        className={`h-9 text-xs font-semibold ${cashGiven === btn.value
                          ? 'bg-primary text-primary-foreground'
                          : 'border-border text-foreground/80 hover:bg-muted/60'
                          }`}
                      >
                        {btn.label}
                      </Button>
                    ))}
                  </div>

                  {/* Kembalian Box */}
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${isCashInsufficient
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-emerald-50/60 border-emerald-200 text-foreground'
                    }`}>
                    <span className="text-xs font-medium">
                      {isCashInsufficient ? 'Nominal uang kurang:' : 'Kembalian Pelanggan:'}
                    </span>
                    <span className={`text-lg font-black font-mono ${isCashInsufficient ? 'text-red-600' : 'text-emerald-700'
                      }`}>
                      {isCashInsufficient
                        ? `- Rp ${(total - cashGiven).toLocaleString('id-ID')}`
                        : `Rp ${change.toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </Card>
              </TabsContent>

              {/* TAB 2: QRIS */}
              <TabsContent value="qris" className="pt-2">
                <Card className="p-6 border-border flex flex-col items-center text-center space-y-4 bg-card shadow-xs">
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-foreground/80 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-foreground" />
                    <span>QRIS Dinamis 7B Coffee</span>
                  </div>

                  {/* QRIS Visual Card */}
                  <div className="relative p-3 bg-card rounded-2xl border-2 border-primary shadow-md flex flex-col items-center">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021226600016ID.CO.QRIS.WWW01189360099800000892402150000000000089240303UME51440014ID.GO.BNI.WWW02150000000000089240303UME520458125303360540735000.005802ID59147B COFFEE POS6007JAKARTA62070703A0163047D4C"
                      alt="QRIS Barcode"
                      className="w-44 h-44 object-contain"
                    />
                    <span className="text-[10px] font-mono text-muted-foreground mt-2 font-semibold">
                      NMID: ID1020089248291
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-4 py-2 rounded-xl border border-border">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Arahkan kamera HP pelanggan ke kode QR di atas</span>
                  </div>
                </Card>
              </TabsContent>

              {/* TAB 3: EDC DEBIT */}
              <TabsContent value="edc" className="space-y-4 pt-2">
                <Card className="p-5 border-border space-y-4 bg-card shadow-xs">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/80">Pilih Mesin EDC</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['EDC BCA 01', 'EDC Mandiri 02', 'EDC BRI 01'].map((edc, i) => (
                        <Button
                          key={edc}
                          type="button"
                          variant={i === 0 ? 'default' : 'outline'}
                          size="sm"
                          className={i === 0 ? 'bg-primary text-primary-foreground' : 'border-border text-foreground/80'}
                        >
                          {edc}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/80">
                      Nomor Approval EDC / Trace Number
                    </label>
                    <Input
                      type="text"
                      placeholder="Contoh: 829401"
                      value={approvalCode}
                      onChange={(e) => setApprovalCode(e.target.value)}
                      className="h-10 text-sm font-mono"
                    />
                  </div>
                </Card>
              </TabsContent>

              {/* TAB 4: TRANSFER VA */}
              <TabsContent value="transfer" className="space-y-4 pt-2">
                <Card className="p-5 border-border space-y-3 bg-card shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground/80">BCA Virtual Account</span>
                    <Badge variant="secondary" className="text-[10px]">Verifikasi Otomatis</Badge>
                  </div>
                  <div className="p-3 bg-muted/60 rounded-xl border border-border flex items-center justify-between font-mono">
                    <span className="text-base font-bold text-foreground tracking-wider">8801 2948 2049 824</span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-foreground/80">
                      Salin
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Atas Nama: <strong>7B COFFEE CABANG SENOPATI</strong></p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <DialogFooter className="flex items-center justify-between sm:justify-between px-6 py-4 bg-muted/60 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 px-5 rounded-xl border-input text-foreground/80 hover:bg-muted font-semibold text-xs"
          >
            Batal / Kembali
          </Button>

          <Button
            type="button"
            onClick={handlePay}
            disabled={isProcessing || isCashInsufficient}
            className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/80 text-primary-foreground font-bold text-sm shadow-md flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesaikan Pembayaran (F8)</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
