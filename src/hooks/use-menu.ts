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

// API bisa mengirim item yang sama lebih dari sekali (mis. satu baris per grup opsi).
// Gabungkan berdasarkan materialName agar id produk unik dan opsinya tidak hilang.
const dedupeMenu = (raw: MenuItemRaw[]): MenuItemRaw[] => {
  const byId = new Map<string, MenuItemRaw>()

  for (const item of raw) {
    const existing = byId.get(item.materialName)

    if (!existing) {
      byId.set(item.materialName, {
        ...item,
        listOption: item.listOption
          ? { results: [...item.listOption.results] }
          : undefined,
      })
      continue
    }

    existing.listOption = {
      results: [
        ...(existing.listOption?.results ?? []),
        ...(item.listOption?.results ?? []),
      ],
    }
  }

  return Array.from(byId.values())
}

const toProduct = (r: MenuItemRaw): Product => ({
  id: r.materialName,
  name: r.materialDesc,
  category: r.category?.trim() || 'Uncategorized',
  // Harga final = priceAfterDisc. Fallback ke unitPrice kalau nilainya kosong.
  price: Number(r.priceAfterDisc || r.unitPrice),
  // Disimpan untuk kebutuhan lain, belum ditampilkan di UI.
  originalPrice: Number(r.unitPrice),
  discountPercent: Number(r.disc),
  image: r.imgUrl || undefined,
  optionGroups: toOptionGroups(r.listOption?.results),
})

export function useMenu() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    menuApi
      .getMenu()
      .then((raw) => setProducts(dedupeMenu(raw).map(toProduct)))
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
