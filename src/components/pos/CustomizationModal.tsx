// @/components/pos/CustomizationModal.tsx
import * as React from 'react'
import { Coffee, Minus, Plus, ShoppingCart } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Product, CartItem } from '@/data/posData'

interface CustomizationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onAddToCart: (item: CartItem) => void
}

// Grup dengan opsi lebih dari ini tampil sebagai dropdown (mis. Beans Type = 14 pilihan)
const DROPDOWN_THRESHOLD = 5

export function CustomizationModal({
  open,
  onOpenChange,
  product,
  onAddToCart,
}: CustomizationModalProps) {
  const groups = React.useMemo(
    () => product?.optionGroups ?? [],
    [product],
  )
  const [selected, setSelected] = React.useState<Record<string, string>>({})
  const [quantity, setQuantity] = React.useState(1)

  React.useEffect(() => {
    if (open) {
      setQuantity(1)
      // Tidak ada opsi yang dipilih otomatis saat modal dibuka
      setSelected({})
    }
  }, [open, product?.id])

  if (!product) return null

  const handleAdd = () => {
    const options = groups.flatMap((g) => {
      const opt = g.options.find((o) => o.key === selected[g.groupId])
      return opt
        ? [
          {
            groupId: g.groupId,
            groupLabel: g.groupLabel,
            optionId: opt.key,
            optionLabel: opt.label,
          },
        ]
        : []
    })

    onAddToCart({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      options,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0">
        <DialogHeader className="bg-primary p-5 text-primary-foreground">
          <div className="flex items-center gap-3">
            <Coffee className="h-5 w-5" />
            <DialogTitle className="text-lg font-bold">
              {product.name}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Pilih opsi untuk {product.name}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto p-5">
          {groups.length === 0 && (
            <p className="text-center text-xs text-muted-foreground">
              Tidak ada opsi untuk produk ini
            </p>
          )}

          {groups.map((g) => (
            <div key={g.groupId} className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground">
                {g.groupLabel}
              </h4>

              {g.options.length > DROPDOWN_THRESHOLD ? (
                <select
                  value={selected[g.groupId] ?? ''}
                  onChange={(e) =>
                    setSelected((p) => ({ ...p, [g.groupId]: e.target.value }))
                  }
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="" disabled>
                    -- Pilih {g.groupLabel} --
                  </option>
                  {g.options.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {g.options.map((o) => (
                    <Button
                      key={o.key}
                      type="button"
                      size="sm"
                      variant={
                        selected[g.groupId] === o.key ? 'default' : 'outline'
                      }
                      onClick={() =>
                        setSelected((p) => ({ ...p, [g.groupId]: o.key }))
                      }
                      className="rounded-xl"
                    >
                      {o.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/60 p-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-6 text-center font-bold tabular-nums">
              {quantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold tabular-nums">
              Rp {(product.price * quantity).toLocaleString('en-US')}
            </span>
            <Button type="button" onClick={handleAdd} className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}