import type { SelectedOption } from '#/types/menu';

export interface Product {
  id: string;
  name: string;
  category: string;
  materialCode?: string;
  // Harga final (sudah termasuk diskon) yang dipakai di seluruh UI.
  // Nilainya diambil dari priceAfterDisc pada response API.
  price: number;
  // Harga sebelum diskon & persen diskon disimpan untuk kebutuhan lain,
  // tapi belum ditampilkan di UI.
  originalPrice?: number;
  discountPercent?: number;
  icon?: string;
  popular?: boolean;
  image?: string;
  optionGroups?: import('#/types/menu').MenuoptionGroup[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  // Harga final per item (sudah termasuk diskon)
  price: number;
  quantity: number;
  options?: SelectedOption[];
  notes?: string;
  size?: string;
  temperature?: string;
  sugar?: string;
  toppings?: string[];
}
