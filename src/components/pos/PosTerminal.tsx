import { useState, useEffect, useMemo, useCallback } from 'react'
import type { ReactNode } from "react";
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { CustomizationModal } from '@/components/pos/CustomizationModal'
import { CheckoutModal } from '@/components/pos/CheckoutModal'
import { HoldOrderModal } from '@/components/pos/HoldOrderModal'
import { SuccessModal } from '@/components/pos/SuccessModal'
import {
  Search,
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  CreditCard,
  PauseCircle,
  Coffee,
  ShoppingBasket,
  UserSearch,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import type { Product, CartItem } from '@/data/posData'
import { SidebarInset, SidebarTrigger } from '#/components/ui/sidebar'
import { useMenu } from '#/hooks/use-menu'

// Replace with API data once available
const SALESPERSONS = [
  { id: 'emp-1', name: 'Rina' },
  { id: 'emp-2', name: 'Budi' },
]

const SALES_TYPES = [
  'Dine In',
  'Take Away',
  'GoFood',
  'GrabFood',
  'ShopeeFood',
  'Qpoon',
  'TikTok Go',
]

// Shared styles for the order details form (theme tokens only)
const fieldLabel = 'text-xs font-semibold text-muted-foreground'
const fieldControl = 'h-10 rounded-xl bg-card border-border text-sm shadow-xs'
const nativeSelect = `${fieldControl} w-full appearance-none border px-3 pr-9 outline-none focus-visible:ring-2 focus-visible:ring-ring`

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className={fieldLabel}>{label}</label>
      {children}
    </div>
  )
}

export function PosTerminal() {
  const { products, categories, isLoading } = useMenu()

  // Catalog filters & search
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Order Details
  const [tableNumber, setTableNumber] = useState('04')
  const [customerName, setCustomerName] = useState('Dimas S.')
  const [salesType, setSalesType] = useState<string>('Dine In')
  const [customerPhone, setCustomerPhone] = useState('')
  const [salespersonId, setSalespersonId] = useState('')
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(
    null,
  )

  // Cart Items
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Modals / sheet state
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [customizingProduct, setCustomizingProduct] =
    useState<Product | null>(null)
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isHoldOpen, setIsHoldOpen] = useState(false)
  const [lastPaymentInfo, setLastPaymentInfo] = useState<{
    method: string
    amountPaid: number
    change: number
  } | null>(null)

  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cartItems])

  const totalQty = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [cartItems])



  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory
      const matchSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      return matchCategory && matchSearch
    })
  }, [products, selectedCategory, searchQuery])

  // Handlers
  const handleOpenCustomization = (product: Product) => {
    setCustomizingProduct(product)
    setIsCustomizationOpen(true)
  }

  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.productId === newItem.productId &&
          i.size === newItem.size &&
          i.temperature === newItem.temperature &&
          i.sugar === newItem.sugar &&
          i.ice === newItem.ice &&
          JSON.stringify(i.toppings) === JSON.stringify(newItem.toppings) &&
          i.notes === newItem.notes,
      )
      if (existing) {
        return prev.map((i) =>
          i.id === existing.id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i,
        )
      }
      return [...prev, newItem]
    })
    // Cart opens automatically after a product is selected
    setIsCartOpen(true)
  }

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCartItems(
      (prev) =>
        prev
          .map((item) => {
            if (item.id === itemId) {
              const newQty = item.quantity + delta
              return newQty > 0 ? { ...item, quantity: newQty } : null
            }
            return item
          })
          .filter(Boolean) as CartItem[],
    )
  }


  const handleClearCart = () => {
    if (
      cartItems.length > 0 &&
      confirm('Are you sure you want to clear all items in this order?')
    ) {
      setCartItems([])
    }
  }



  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) return
    // TODO: validasi voucher ke API
    setAppliedVoucher(voucherCode.trim().toUpperCase())
  }

  const handleOpenCheckout = useCallback(() => {
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }, [])

  const handlePaymentSuccess = (paymentInfo: {
    method: string
    amountPaid: number
    change: number
  }) => {
    setLastPaymentInfo(paymentInfo)
    setIsSuccessOpen(true)
  }

  const handleNewTransaction = () => {
    setCartItems([])
    setTableNumber('01')
    setCustomerName('')
    setSalesType('Dine In')
    setCustomerPhone('')
    setSalespersonId('')
    setVoucherCode('')
    setAppliedVoucher(null)
  }

  const handleHoldOrder = (destination: string) => {
    setIsHoldOpen(false)
    alert(`Order saved to ${destination}.`)
  }

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('pos-search-input')?.focus()
      }
      if (e.key === 'F8' && cartItems.length > 0) {
        e.preventDefault()
        handleOpenCheckout()
      }
      if (e.key === 'F4') {
        e.preventDefault()
        setIsHoldOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cartItems.length, handleOpenCheckout])

  return (
    <SidebarInset
      className={`min-w-0 h-full overflow-hidden transition-[margin] duration-300 ease-in-out ${isCartOpen ? 'sm:mr-80 lg:mr-96' : 'mr-0'
        }`}
    >
      {/* TOP STATUS BAR */}
      <header className="h-14 bg-card border-b border-border px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-20 gap-2">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-xs shrink-0">
          {/* CART SHEET (no overlay / non-modal) */}
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen} modal={false}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="relative h-9 w-9 border-border text-foreground/80 hover:bg-muted"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalQty > 0 && (
                  <Badge className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {totalQty}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              // Clicking the catalog/other modals does not close the sheet
              onInteractOutside={(e) => e.preventDefault()}
              onPointerDownOutside={(e) => e.preventDefault()}
              className="w-full max-w-full sm:w-80 sm:max-w-80 lg:w-96 lg:max-w-96 p-0 gap-0 bg-card flex flex-col select-none shadow-lg"
            >
              <SheetTitle className="sr-only">Active Order</SheetTitle>
              <SheetDescription className="sr-only">
                Order items, bill summary, and payment button.
              </SheetDescription>

              {/* Cart Header */}
              <div className="p-4 pr-12 border-b border-border/60 bg-muted/60 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">
                        Active Order
                      </h3>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearCart}
                    title="Clear Order"
                    className="h-8 w-8 text-muted-foreground/70 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Items + Order Details share one scroll area */}
              <div
                className={`flex-1 overflow-y-auto p-4 min-h-0 ${cartItems.length === 0 ? 'flex flex-col' : 'space-y-4'
                  }`}
              >
                {cartItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground/70">
                    <ShoppingBasket className="w-10 h-10 mb-2 text-muted-foreground/50" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      Empty Cart
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Select an item to add to the cart.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl bg-muted/60 p-4">
                      {/* Summary header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border">
                        <span className="text-sm font-semibold text-muted-foreground">
                          {cartItems.length} Item(s)
                        </span>
                        <span className="text-base font-bold tabular-nums text-primary">
                          Rp {subtotal.toLocaleString('en-US')}
                        </span>
                      </div>

                      {/* Rows: the list grows with every product added */}
                      <div className="divide-y divide-border/60">
                        {cartItems.map((item) => {
                          const modifiers = [
                            item.size,
                            item.temperature,
                            item.sugar ? `Sugar ${item.sugar}` : null,
                            ...(item.toppings ?? []),
                          ]
                            .filter(Boolean)
                            .join(', ')

                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-3 py-3 last:pb-0"
                            >
                              <div className="min-w-0">
                                <h5 className="font-bold text-sm text-foreground leading-tight">
                                  {item.name}
                                </h5>
                                <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                                  Rp {item.price.toLocaleString('en-US')} x{' '}
                                  {item.quantity}
                                </p>
                                {modifiers && (
                                  <p className="text-[11px] text-muted-foreground mt-0.5">
                                    {modifiers}
                                  </p>
                                )}
                                {item.notes && (
                                  <p className="text-[11px] italic text-muted-foreground mt-0.5">
                                    "{item.notes}"
                                  </p>
                                )}
                              </div>

                              {/* Stepper: minus at qty 1 removes the item */}
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(item.id, -1)}
                                  className="w-7 h-7 rounded-md bg-card border border-red-300 text-red-500 flex items-center justify-center hover:bg-red-50 active:scale-95 cursor-pointer"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-5 text-center font-bold text-sm tabular-nums text-foreground">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateQty(item.id, 1)}
                                  className="w-7 h-7 rounded-md bg-card border border-primary/50 text-primary flex items-center justify-center hover:bg-primary/10 active:scale-95 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Order Details Form */}
                    <div className="space-y-3 border-t border-border pt-4">
                      <Field label="Tipe Penjualan">
                        <div className="flex flex-wrap gap-1.5">
                          {SALES_TYPES.map((t) => {
                            const isSelected = salesType === t
                            return (
                              <Badge
                                key={t}
                                role="button"
                                tabIndex={0}
                                variant={isSelected ? 'default' : 'outline'}
                                onClick={() => setSalesType(t)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    setSalesType(t)
                                  }
                                }}
                                className={`cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-card text-foreground/80 border-border hover:bg-muted'
                                  }`}
                              >
                                {t}
                              </Badge>
                            )
                          })}
                        </div>
                      </Field>

                      <Field label="Customer Name">
                        <div className="relative">
                          <UserSearch className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/70" />
                          <Input
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Search or type the customer name..."
                            className={`${fieldControl} pl-10`}
                          />
                        </div>
                      </Field>

                      <Field label="Customer Phone Number">
                        <div className="relative">
                          <Input
                            type="tel"
                            inputMode="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="0812xxxxxxxx"
                            className={`${fieldControl} pr-28`}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wide text-primary hover:underline cursor-pointer"
                          >
                            Register Member
                          </button>
                        </div>
                      </Field>

                      {/* <Field label="Scan / Input Aivola ID (Employee)">
                        <div className="flex gap-2">
                          <div className="relative flex-1 min-w-0">
                            <Input
                              value={aivolaToken}
                              onChange={(e) => setAivolaToken(e.target.value)}
                              placeholder="Paste token Aivola ID"
                              className={`${fieldControl} pr-10`}
                            />
                            <ScanLine className="absolute right-3 top-3 w-4 h-4 text-primary" />
                          </div>
                          <Button
                            type="button"
                            onClick={handleApplyAivola}
                            className="h-10 rounded-xl px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/80"
                          >
                            Apply
                          </Button>
                        </div>
                      </Field> */}

                      <Field label="Kode Voucher">
                        <div className="flex gap-2">
                          <Input
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            placeholder="Enter voucher code"
                            className={`${fieldControl} flex-1 min-w-0`}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={handleApplyVoucher}
                            className="h-10 rounded-xl px-4 text-xs font-semibold"
                          >
                            Apply
                          </Button>
                        </div>
                        {appliedVoucher && (
                          <p className="text-[11px] font-medium text-primary">
                            Voucher {appliedVoucher} applied
                          </p>
                        )}
                      </Field>
                    </div>
                  </>
                )}
              </div>

              {/* Cart Footer */}
              <div className="p-4 bg-card border-t border-border space-y-3 shrink-0">
                <div className="space-y-1.5 text-xs text-muted-foreground font-medium">
                  {/* <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="tabular-nums text-foreground">
                      Rp {subtotal.toLocaleString('en-US')}
                    </span>
                  </div> */}
                  {/* <div className="flex justify-between">
                    <span>Restaurant Tax (10%)</span>
                    <span className="tabular-nums text-foreground">
                      Rp {tax.toLocaleString('en-US')}
                    </span>
                  </div> */}
                  <Separator className="my-1.5" />
                  <div className="flex items-baseline justify-between text-foreground font-bold">
                    <span className="text-sm">Total Bill</span>
                    <span className="text-xl tabular-nums">
                      Rp {subtotal.toLocaleString('en-US')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons (Hold & Pay Now side by side) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 text-xs font-semibold border-input hover:bg-muted gap-1 rounded-xl"
                    onClick={() => setIsHoldOpen(true)}
                  >
                    <PauseCircle className="w-4 h-4" />
                    <span>Hold (F4)</span>
                  </Button>

                  <Button
                    disabled={cartItems.length === 0}
                    onClick={handleOpenCheckout}
                    className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold h-12 rounded-xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-1.5 px-2 transition-transform active:scale-[0.98]"
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span className="truncate">Pay Now (F8)</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* PRODUCT CATALOG PANEL */}
      <div className="flex-1 flex flex-col bg-muted/60 overflow-hidden p-5 min-w-0">
        {/* Search Bar */}
        <div className="flex items-center gap-3 shrink-0 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground/70" />
            <Input
              id="pos-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu..."
              className="pl-10 h-11 bg-card text-sm rounded-xl border-border shadow-xs focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 pb-3">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id
            return (
              <Button
                key={cat.id}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-xl h-9 px-4 text-xs font-semibold whitespace-nowrap shadow-xs ${isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground/80 border-border hover:bg-muted'
                  }`}
              >
                <span>{cat.name}</span>
              </Button>
            )
          })}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-4 pb-6">
              {filteredProducts.map((product) => {
                const totalCountInCart = cartItems
                  .filter((i) => i.productId === product.id)
                  .reduce((sum, i) => sum + i.quantity, 0)

                return (
                  <Card
                    key={product.id}
                    onClick={() => handleOpenCustomization(product)}
                    className="group p-4 bg-card border-border shadow-xs hover:shadow-md hover:border-input transition-all cursor-pointer flex flex-col justify-between rounded-2xl"
                  >
                    <div>
                      {/* Top Icon & Badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                          <Coffee className="w-5 h-5 text-foreground/90" />
                        </div>
                        {totalCountInCart > 0 && (
                          <Badge className="bg-primary text-primary-foreground text-[11px] px-2 py-0.5 font-bold">
                            {totalCountInCart} in cart
                          </Badge>
                        )}
                      </div>

                      {/* Info */}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                        {product.category}
                      </span>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-primary mt-0.5">
                        {product.name}
                      </h4>
                    </div>

                    {/* Price & Action */}
                    <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between">
                      <span className="font-bold text-sm tabular-nums text-foreground">
                        Rp {product.price.toLocaleString('en-US')}
                      </span>
                      <Button
                        size="sm"
                        className="h-8 px-2.5 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground text-xs font-semibold gap-1 shadow-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenCustomization(product)
                        }}
                      >
                        <span>Select</span>
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. SHADCN MODALS */}
      <CustomizationModal
        open={isCustomizationOpen}
        onOpenChange={setIsCustomizationOpen}
        product={customizingProduct}
        onAddToCart={handleAddToCart}
      />

      <CheckoutModal
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        items={cartItems}
        subtotal={subtotal}
        total={subtotal}
        tableNumber={tableNumber}
        customerName={customerName}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <SuccessModal
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
        items={cartItems}
        subtotal={subtotal}
        total={subtotal}
        paymentInfo={lastPaymentInfo}
        tableNumber={tableNumber}
        onNewTransaction={handleNewTransaction}
      />

      <HoldOrderModal
        open={isHoldOpen}
        onOpenChange={setIsHoldOpen}
        onConfirm={handleHoldOrder}
      />
    </SidebarInset>
  )
}
