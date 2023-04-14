import { type Product } from "@prisma/client";

export interface ProductVariantDetail {
  attribute: string;
  value: string | number;
}

export interface ProductVariant {
  id: string;
  price: number;
  productId: string;
  sku: string;
  details: ProductVariantDetail[];
  product: Product;
}

export interface ProductWithVariants extends Omit<Product, "organizationId"> {
  productType: string;
  variants: ProductVariant[];
}

export interface Order {
  quantity: number;
  productVariant: ProductVariant;
}
