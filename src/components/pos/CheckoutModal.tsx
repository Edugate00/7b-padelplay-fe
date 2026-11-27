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
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import {
  QrCode,
  CreditCard,
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
  total: number
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
  total,
  customerName,
  onPaymentSuccess,
}: CheckoutModalProps) {
  // Cash disembunyikan sementara — hanya QRIS & EDC yang aktif
  const [paymentMethod, setPaymentMethod] = React.useState('qris')
  const [showItemsDetail, setShowItemsDetail] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [approvalCode, setApprovalCode] = React.useState('')

  const handlePay = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onPaymentSuccess({
        method: paymentMethod.toUpperCase(),
        amountPaid: total,
        change: 0,
      })
      onOpenChange(false)
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border border-border">
        <DialogClose onClick={() => onOpenChange(false)} />

        {/* Modal Header (Ditambah pr-14 agar tidak tertutup tombol close X) */}
        <DialogHeader className="bg-primary text-primary-foreground p-6 pr-14 border-b-0 space-y-0">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold text-primary-foreground tracking-tight">
                  Confirm end payment
                </DialogTitle>
              </div>
              <DialogDescription className="text-primary-foreground/70 text-xs truncate">
                {customerName ? `for ${customerName}` : ''}
              </DialogDescription>
            </div>

            {/* Total Highlight (Diberi jarak aman dan text sizing agar rapi) */}
            <div className="text-right shrink-0 flex flex-col justify-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/70 block mb-0.5">
                Total Amount
              </span>
              <span className="text-xl sm:text-2xl font-black tabular-nums text-primary-foreground tracking-tight leading-none">
                Rp {total.toLocaleString('en-US')}
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
                <span>
                  Order Details ({items.reduce((s, i) => s + i.quantity, 0)}{' '}
                  Item)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <span>{showItemsDetail ? 'Hide Details' : 'Show Details'}</span>
                {showItemsDetail ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {showItemsDetail && (
              <div className="mt-3 pt-3 border-t border-border space-y-2 text-xs">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-foreground">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-muted-foreground text-[11px] ml-1.5">
                        (
                        {[
                          ...(item.options ?? []).map((o) => o.optionLabel),
                          item.size,
                          item.temperature,
                        ]
                          .filter(Boolean)
                          .join(' / ')}
                        )
                      </span>
                    </div>
                    <span className="tabular-nums text-foreground/80">
                      Rp {(item.price * item.quantity).toLocaleString('en-US')}
                    </span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span>Subtotal: Rp {subtotal.toLocaleString('en-US')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector via Shadcn Tabs */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Select Payment Method
            </label>

            <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
              <TabsList className="grid grid-cols-2 h-12 bg-muted p-1 rounded-xl">
                <TabsTrigger value="qris" className="gap-1.5 text-xs">
                  <QrCode className="w-4 h-4" />
                  <span>QRIS</span>
                </TabsTrigger>
                <TabsTrigger value="edc" className="gap-1.5 text-xs">
                  <CreditCard className="w-4 h-4" />
                  <span>Card (EDC)</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: QRIS */}
              <TabsContent value="qris" className="pt-2">
                <Card className="p-6 border-border flex flex-col items-center text-center space-y-4 bg-card shadow-xs">
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-foreground/80 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-foreground" />
                    <span>7B Coffee Dynamic QRIS</span>
                  </div>

                  {/* QRIS Visual Card */}
                  <div className="relative p-3 bg-card rounded-2xl border-2 border-primary shadow-md flex flex-col items-center">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021226600016ID.CO.QRIS.WWW011893600998000008924021500000000000089240303UME51440014ID.GO.BNI.WWW02150000000000089240303UME520458125303360540735000.005802ID59147B COFFEE POS6007JAKARTA62070703A0163047D4C"
                      alt="QRIS Barcode"
                      className="w-44 h-44 object-contain"
                    />
                    <span className="text-[10px] tabular-nums text-muted-foreground mt-2 font-semibold">
                      NMID: ID1020089248291
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 px-4 py-2 rounded-xl border border-border">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Ask the customer to scan the QR code above</span>
                  </div>
                </Card>
              </TabsContent>

              {/* TAB 2: EDC DEBIT */}
              <TabsContent value="edc" className="space-y-4 pt-2">
                <Card className="p-5 border-border space-y-4 bg-card shadow-xs">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/80">
                      Select EDC Terminal
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['EDC BCA 01', 'EDC Mandiri 02', 'EDC BRI 01'].map(
                        (edc, i) => (
                          <Button
                            key={edc}
                            type="button"
                            variant={i === 0 ? 'default' : 'outline'}
                            size="sm"
                            className={
                              i === 0
                                ? 'bg-primary text-primary-foreground'
                                : 'border-border text-foreground/80'
                            }
                          >
                            {edc}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground/80">
                      EDC Approval Code / Trace Number
                    </label>
                    <Input
                      type="text"
                      placeholder="Example: 829401"
                      value={approvalCode}
                      onChange={(e) => setApprovalCode(e.target.value)}
                      className="h-10 text-sm tabular-nums"
                    />
                  </div>
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
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            className="h-11 px-7 rounded-xl bg-primary hover:bg-primary/80 text-primary-foreground font-bold text-sm shadow-md flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Payment (F8)</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}