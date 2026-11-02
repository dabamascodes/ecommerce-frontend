export interface Product {
  id: string | number;
  sku?: string;
  title: string;
  name?: string;
  price: number;
  description?: string;
  slug: string;
  stock: number;
  sizes: string[];
  gender: string;
  tags: string[];
  images: string[];
}