import * as React from 'react'
import type { MenuItemRaw } from '#/types/menu'
import type { Product } from '@/data/posData'
import { menuApi } from './api'

const toProduct = (r: MenuItemRaw): Product =>
  ({
    id: r.materialName,
    name: r.materialDesc,
    price: Number(r.unitPrice),
    category: r.category,
  }) as Product

export function useMenu() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    menuApi
      .getMenu()
      .then((raw) => setProducts(raw.map(toProduct)))
      .finally(() => setIsLoading(false))
  }, [])

  const categories = React.useMemo(
    () => [
      { id: 'all', name: 'All' },
      ...Array.from(new Set(products.map((p) => p.category))).map((c) => ({
        id: c,
        name: c,
      })),
    ],
    [products],
  )

  return { products, categories, isLoading }
}