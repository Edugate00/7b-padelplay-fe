// #/types/menu.ts
export interface MenuItemRaw {
  materialName: string
  materialDesc: string
  unit: string
  unitDesc: string
  unitPrice: string
  imgUrl: string
  category: string
}

export interface MenuResponse {
  success: boolean
  message: string
  data: { listMenu: MenuItemRaw[] }
}
