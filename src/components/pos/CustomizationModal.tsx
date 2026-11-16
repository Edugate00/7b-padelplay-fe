import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Coffee, Plus, Minus, Check, ShoppingCart } from 'lucide-react'
import type { Product, CartItem } from '@/data/posData'

// ---- Constants (outside the component so they are not recreated on every render) ----
const TEMPERATURES = ['Iced', 'Hot'] as const
const SUGARS = ['100%', '50%', '0%'] as const
const ICES = ['Normal', 'Less', 'None'] as const

const SIZES = [
  { value: 'Regular', label: 'Regular', extra: 0 },
  { value: 'Large', label: 'Large', extra: 6000 },
] as const

const ADDONS = [
  {
    name: 'Extra Espresso Shot',
    price: 8000,
  },
  {
    name: 'Oat Milk Substitute',
    price: 10000,
  },
  {
    name: 'Caramel Sauce Drizzle',
    price: 6000,
  },
] as const

const ADDON_PRICE: Record<string, number> = Object.fromEntries(
  ADDONS.map((a) => [a.name, a.price]),
)

const SIZE_EXTRA: Record<string, number> = Object.fromEntries(
  SIZES.map((s) => [s.value, s.extra]),
)

const labelCls = 'text-xs font-bold tracking-wider text-foreground/80'

// ---- Modal (shell) ----
interface CustomizationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onAddToCart: (item: CartItem) => void
}

export function CustomizationModal({
  open,
  onOpenChange,
  product,
  onAddToCart,
}: CustomizationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border border-border">
        <DialogClose onClick={() => onOpenChange(false)} />

        {/* The form is remounted every time the modal opens -> state is always fresh,
            without a reset useEffect */}
        {product && (
          <CustomizationForm
            product={product}
            onAddToCart={onAddToCart}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// ---- Form (state lokal) ----
function CustomizationForm({
  product,
  onAddToCart,
  onClose,
}: {
  product: Product
  onAddToCart: (item: CartItem) => void
  onClose: () => void
}) {
  const [temperature, setTemperature] =
    React.useState<(typeof TEMPERATURES)[number]>('Iced')
  const [size, setSize] =
    React.useState<(typeof SIZES)[number]['value']>('Regular')
  const [sugar, setSugar] = React.useState<(typeof SUGARS)[number]>('100%')
  const [ice, setIce] = React.useState<(typeof ICES)[number]>('Normal')
  const [selectedToppings, setSelectedToppings] = React.useState<string[]>([])
  const [qty, setQty] = React.useState(1)

  const toppingsPrice = selectedToppings.reduce(
    (total, t) => total + (ADDON_PRICE[t] ?? 0),
    0,
  )
  const unitPrice = product.price + (SIZE_EXTRA[size] ?? 0) + toppingsPrice
  const totalPrice = unitPrice * qty

  const handleSelectTemperature = (temp: (typeof TEMPERATURES)[number]) => {
    setTemperature(temp)
    // Hot -> no ice; Iced -> back to Normal
    setIce(temp === 'Hot' ? 'None' : 'Normal')
  }

  const handleToggleTopping = (topping: string) => {
    setSelectedToppings((prev) =>
      prev.includes(topping)
        ? prev.filter((t) => t !== topping)
        : [...prev, topping],
    )
  }

  const handleSave = () => {
    onAddToCart({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: unitPrice,
      quantity: qty,
      temperature,
      size,
      sugar,
      ice: temperature === 'Hot' ? 'None' : ice,
      toppings: selectedToppings,
    })
    onClose()
  }

  return (
    <>
      {/* Modal Header */}
      <DialogHeader className="bg-primary text-primary-foreground p-6 border-b-0">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary/80 text-primary-foreground flex items-center justify-center shadow-xs">
            <Coffee className="w-6 h-6 text-primary-foreground/80" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl font-bold text-primary-foreground tracking-tight">
                {product.name}
              </DialogTitle>
              <Badge variant="secondary" className="text-[10px] font-medium">
                {product.materialCode}
              </Badge>
            </div>
          </div>
        </div>
      </DialogHeader>

      {/* Modal Body */}
      <div className="p-6 space-y-5 max-h-[66vh] overflow-y-auto">
        {/* Temperature Choice */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={labelCls}>Temperature</label>
            <Badge variant="secondary" className="text-[10px] font-medium">
              Required
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TEMPERATURES.map((temp) => (
              <button
                key={temp}
                type="button"
                aria-pressed={temperature === temp}
                onClick={() => handleSelectTemperature(temp)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${temperature === temp
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-foreground/80 border-border hover:bg-muted/60'
                  }`}
              >
                <span>{temp === 'Iced' ? 'Ice' : 'Hot'}</span>
              </button>
            ))}
          </div>
        </div>
        <Separator />

        {/* Size Choice */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={labelCls}>Size</label>
            <Badge variant="secondary" className="text-[10px] font-medium">
              Required
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {SIZES.map((s) => {
              const active = size === s.value
              return (
                <button
                  key={s.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSize(s.value)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-foreground/90 border-border hover:bg-muted/60'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{s.label}</span>
                    {s.extra === 0 ? (
                      <span
                        className={`text-[11px] ${active
                          ? 'text-muted-foreground/50'
                          : 'text-muted-foreground'
                          }`}
                      >
                        Standard
                      </span>
                    ) : (
                      <Badge
                        variant={active ? 'secondary' : 'outline'}
                        className="text-[10px] px-1.5 py-0"
                      >
                        +Rp {s.extra.toLocaleString('en-US')}
                      </Badge>
                    )}
                  </div>
                  <p
                    className={`text-xs mt-1 tabular-nums ${active
                      ? 'text-primary-foreground/80'
                      : 'text-foreground/80'
                      }`}
                  >
                    Rp {(product.price + s.extra).toLocaleString('en-US')}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <Separator />

        {/* Sweetness & Ice */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={labelCls}>Sugar Level</label>
            <div className="flex gap-1.5">
              {SUGARS.map((s) => (
                <Button
                  key={s}
                  type="button"
                  size="sm"
                  variant={sugar === s ? 'default' : 'outline'}
                  onClick={() => setSugar(s)}
                  className={`flex-1 text-xs h-8 transition-colors ${sugar === s
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border text-foreground/80'
                    }`}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Ice level</label>
            <div className="flex gap-1.5">
              {ICES.map((i) => (
                <Button
                  key={i}
                  type="button"
                  size="sm"
                  disabled={temperature === 'Hot'}
                  variant={ice === i ? 'default' : 'outline'}
                  onClick={() => setIce(i)}
                  className={`flex-1 text-xs h-8 transition-colors ${ice === i
                    ? 'bg-primary text-primary-foreground'
                    : 'border-border text-foreground/80'
                    }`}
                >
                  {i}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Add-ons */}
        <div className="space-y-2">
          <label className={labelCls}>Extras / Optional Toppings</label>
          <div className="space-y-2">
            {ADDONS.map((addon) => {
              const checked = selectedToppings.includes(addon.name)
              return (
                <button
                  key={addon.name}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => handleToggleTopping(addon.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-colors ${checked
                    ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                    : 'bg-card border-border hover:bg-muted/60 text-foreground'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${checked
                        ? 'bg-card border-primary-foreground text-foreground'
                        : 'border-input bg-card'
                        }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{addon.name}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold tabular-nums">
                    +Rp {addon.price.toLocaleString('en-US')}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="flex items-center justify-between px-6 py-4 bg-muted/60 border-t border-border">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted text-foreground/80 active:scale-95 shadow-xs cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-7 text-center font-bold text-foreground text-sm">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => q + 1)}
            className="w-9 h-9 rounded-lg border border-border bg-card flex items-center justify-center hover:bg-muted text-foreground/80 active:scale-95 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block"></span>
            <span className="text-base font-bold text-foreground tabular-nums">
              Rp {totalPrice.toLocaleString('en-US')}
            </span>
          </div>

          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold h-11 px-5 rounded-xl shadow-md gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </Button>
        </div>
      </div>
    </>
  )
}
