import React from "react";
import { useAtomValue } from "jotai";
import { filteredProductsVariantAtom } from "./posStates";
import { ProductCard } from "./ProductCard";
import { SimpleGrid, Space, Text } from "@mantine/core";

export const ProductSelector = () => {
  const productVariants = useAtomValue(filteredProductsVariantAtom);

  return (
    <>
      <Text fw="bold" fz="xl">
        Products
      </Text>
      <Space h="sm" />
      <SimpleGrid
        breakpoints={[
          { cols: 1, minWidth: "xs" },
          { cols: 2, minWidth: "sm" },
          { cols: 4, minWidth: "md" },
        ]}
        spacing="xs"
        mr="xs"
      >
        {productVariants.map((productVariant) => (
          <ProductCard
            productVariant={productVariant}
            key={productVariant.id}
          />
        ))}
      </SimpleGrid>
    </>
  );
};
