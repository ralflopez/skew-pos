import React from "react";
import { type Order } from "~/types/product";
import { Box, Flex, Text } from "@mantine/core";
import { currencyFormatter } from "~/config/formatter";

interface Props {
  order: Order;
}

export const OrderItem = ({ order: { productVariant, quantity } }: Props) => {
  return (
    <Flex
      key={productVariant.sku}
      mb="sm"
      justify="space-between"
      align="center"
    >
      <Flex>
        <Box>
          <Text>{productVariant.product.brand}</Text>
          <Text>{productVariant.product.name}</Text>
        </Box>
        <Text c="gray" ml="sm">
          x{quantity}
        </Text>
      </Flex>
      <Text mr="sm">
        {currencyFormatter.format((productVariant.price || 0) * quantity)}
      </Text>
    </Flex>
  );
};
