import * as React from 'react'
import type {
  MenuItemRaw,
  MenuOptionRaw,
  MenuoptionGroup,
} from '#/types/menu'
import type { Product } from '@/data/posData'
import { menuApi } from './api'

// Ubah listOption.results (flat) menjadi grup unik per groupId
const toOptionGroups = (raw: MenuOptionRaw[] = []): MenuoptionGroup[] => {
  const groups = new Map<string, MenuoptionGroup>()

  for (const option of raw) {
    let group = groups.get(option.groupId)
    if (!group) {
      group = {
        groupId: option.groupId,
        groupLabel: option.optionGroupDescription,
        options: [],
      }
      groups.set(option.groupId, group)
    }

    // Satu opsi bisa muncul lebih dari sekali di response, hindari duplikat
    if (!group.options.some((o) => o.key === option.optionId)) {
      group.options.push({
        key: option.optionId,
        label: option.optionDescription,
      })
    }
  }

  return Array.from(groups.values())
}

const toProduct = (r: MenuItemRaw): Product =>
  ({
    id: r.materialName,
    name: r.materialDesc,
    price: Number(r.unitPrice),
    category: r.category,
    image: r.imgUrl || undefined,
    optionGroups: toOptionGroups(r.listOption?.results),
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
