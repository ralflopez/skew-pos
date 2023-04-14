import { atom } from "jotai";
import { type Category } from "./CategorySelector";
import { type ProductVariant, type ProductWithVariants } from "~/types/product";

export const categoriesAtom = atom<Category[]>([]);
export const selectedCategoryAtom = atom<string>("ALL");

export const productsAtom = atom<ProductWithVariants[]>([]);
export const productVariantsAtom = atom<ProductVariant[]>((get) => {
  const productList = get(productsAtom);
  return productList.reduce<ProductVariant[]>(
    (acc, product) => acc.concat(product.variants),
    []
  );
});

export const filteredProductsVariantAtom = atom<ProductVariant[]>((get) => {
  const productList = get(productsAtom);
  const selected = get(selectedCategoryAtom);

  const selectedProducts = productList.filter((product) =>
    selected === "ALL" ? true : product.brand === selected
  );

  return selectedProducts.reduce<ProductVariant[]>((acc, product) => {
    return acc.concat(product.variants);
  }, []);
});

export const orderAtom = atom<
  { productVariant: ProductVariant; quantity: number }[]
>([]);
