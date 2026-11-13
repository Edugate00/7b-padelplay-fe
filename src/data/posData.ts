export interface Product {
  id: string
  name: string
  category: string
  price: number
  icon: string
  popular?: boolean
  image?: string
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  temperature?: 'Hot' | 'Iced'
  size?: 'Regular' | 'Large'
  sugar?: '0%' | '50%' | '100%'
  ice?: 'Normal' | 'Less' | 'None'
  toppings?: string[]
  notes?: string
}

export const CATEGORIES = [
  { id: 'all', name: 'Semua Menu', icon: 'grid_view' },
  { id: 'signature', name: '7B Signature', icon: 'star' },
  { id: 'coffee', name: 'Coffee', icon: 'coffee' },
  { id: 'non-coffee', name: 'Non-Coffee', icon: 'local_bar' },
  { id: 'pastry', name: 'Pastry & Bakery', icon: 'bakery_dining' },
  { id: 'snack', name: 'Snack & Bites', icon: 'cookie' },
]

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Raspberry Squash',
    category: 'non-coffee',
    price: 35000,
    icon: 'local_bar',
    popular: true,
  },
  {
    id: 'prod-2',
    name: 'Rotiso - Cranberry Cheese',
    category: 'pastry',
    price: 28000,
    icon: 'bakery_dining',
    popular: true,
  },
  {
    id: 'prod-3',
    name: 'Caramel Macchiato',
    category: 'signature',
    price: 38000,
    icon: 'coffee',
    popular: true,
  },
  {
    id: 'prod-4',
    name: 'Americano Roast Blend',
    category: 'coffee',
    price: 25000,
    icon: 'coffee',
  },
  {
    id: 'prod-5',
    name: 'Vanilla Sweet Cream Cold Brew',
    category: 'signature',
    price: 39000,
    icon: 'local_cafe',
    popular: true,
  },
  {
    id: 'prod-6',
    name: 'Matcha Latte Uji',
    category: 'non-coffee',
    price: 36000,
    icon: 'emoji_food_beverage',
  },
  {
    id: 'prod-7',
    name: 'Butter Croissant Premium',
    category: 'pastry',
    price: 26000,
    icon: 'bakery_dining',
  },
  {
    id: 'prod-8',
    name: 'Pain Au Chocolat',
    category: 'pastry',
    price: 30000,
    icon: 'bakery_dining',
  },
  {
    id: 'prod-9',
    name: 'Espresso Romano Single',
    category: 'coffee',
    price: 22000,
    icon: 'coffee',
  },
  {
    id: 'prod-10',
    name: 'Earl Grey Milk Tea',
    category: 'non-coffee',
    price: 32000,
    icon: 'emoji_food_beverage',
  },
  {
    id: 'prod-11',
    name: 'Truffle French Fries',
    category: 'snack',
    price: 32000,
    icon: 'fastfood',
  },
  {
    id: 'prod-12',
    name: 'Kaya Toast Butter',
    category: 'snack',
    price: 24000,
    icon: 'breakfast_dining',
  },
]
