import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Coffee, Plus, Search } from 'lucide-react'

import { PageShell } from '@/components/page-shell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CATEGORIES, PRODUCTS } from '@/data/posData'

export const Route = createFileRoute('/_app/product-catalog')({
  head: () => ({ meta: [{ title: 'Product Catalog · 7B Coffee POS' }] }),
  component: ProductCatalogPage,
})

function ProductCatalogPage() {
  const [category, setCategory] = React.useState('all')
  const [query, setQuery] = React.useState('')

  const products = PRODUCTS.filter((product) => {
    const matchCategory = category === 'all' || product.category === category
    const matchQuery = product.name.toLowerCase().includes(query.toLowerCase())

    return matchCategory && matchQuery
  })

  return (
    <PageShell
      title="Product Catalog"
      description="Manage menu items, prices, and product categories."
      actions={
        <Button size="sm" className="h-9 gap-1.5 text-xs font-semibold">
          <Plus className="size-4" />
          Add Product
        </Button>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="h-9 pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={category === item.id ? 'default' : 'outline'}
              onClick={() => setCategory(item.id)}
              className="h-8 whitespace-nowrap text-xs font-semibold"
            >
              {item.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="flex flex-col justify-between gap-4 border-border p-4 shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-foreground/80">
                  <Coffee className="size-5" />
                </span>
                {product.popular ? (
                  <Badge className="bg-primary text-primary-foreground text-[10px]">
                    Popular
                  </Badge>
                ) : null}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {product.category}
                </p>
                <h3 className="line-clamp-1 text-sm font-bold">
                  {product.name}
                </h3>
                <p className="mt-1 tabular-nums text-sm font-semibold">
                  Rp {product.price.toLocaleString('en-US')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 flex-1 text-xs"
                onClick={() => alert(`Edit product: ${product.name}`)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                className="h-8 flex-1 text-xs"
                onClick={() => alert(`Product ${product.name} activated`)}
              >
                Manage
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {products.length === 0 ? (
        <Card className="border-border p-10 text-center text-sm text-muted-foreground shadow-xs">
          No products match your search.
        </Card>
      ) : null}
    </PageShell>
  )
}
