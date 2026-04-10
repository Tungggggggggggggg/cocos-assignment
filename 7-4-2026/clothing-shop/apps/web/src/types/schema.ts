export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  min_price?: number;
  category_id?: string;
  category_name?: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  retail_price: number;
  available_qty: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Order {
  id: string;
  order_no: string;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'cancelled';
  created_at: string;
}
