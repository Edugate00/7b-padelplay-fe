// #/types/menu.ts
export interface MenuOptionRaw {
  materialName: string
  groupId: string
  substitutionNumber: string
  optionGroupDescription: string
  unitOfMeasure: string
  quantity: string
  optionDescription: string
  optionId: string
}

export interface MenuItemRaw {
  materialName: string
  materialDesc: string
  unit: string
  unitDesc: string
  unitPrice: string
  imgUrl: string
  category: string
  listOption?: { results: MenuOptionRaw[] }
}

export interface MenuResponse {
  success: boolean
  message: string
  data: { listMenu: MenuItemRaw[] }
}

export interface MenuOption {
  key: string
  label: string
}

export interface MenuoptionGroup {
  groupId: string
  groupLabel: string
  options: MenuOption[]
}

export interface SelectedOption {
  groupId: string
  groupLabel: string
  optionId: string
  optionLabel: string
}
