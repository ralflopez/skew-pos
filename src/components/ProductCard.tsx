import React from "react";
import { Box, Button, Card, Text, Flex } from "@mantine/core";
import { type ProductVariant } from "~/types/product";
import { useAtomValue, useSetAtom } from "jotai";
import { orderAtom } from "./posStates";

interface Props {
  productVariant: ProductVariant;
}

export const ProductCard = ({ productVariant }: Props) => {
  const orders = useAtomValue(orderAtom);
  const setOrder = useSetAtom(orderAtom);
  const quantity =
    orders.find((order) => order.productVariant.sku === productVariant.sku)
      ?.quantity || 0;

  const decrement = () => {
    setOrder((order) => {
      const newOrder = [...order];
      const productOrder = newOrder.find(
        (order) => order.productVariant.sku === productVariant.sku
      );

      if (!productOrder) return newOrder;

      if (productOrder.quantity > 0) productOrder.quantity--;

      if (productOrder.quantity < 1) {
        return newOrder.filter(
          (order) =>
            order.productVariant.sku !== productOrder.productVariant.sku
        );
      }

      return newOrder;
    });
  };

  const increment = () => {
    setOrder((order) => {
      const newOrder = [...order];
      const productOrder = newOrder.find(
        (order) => order.productVariant.sku === productVariant.sku
      );
      if (productOrder) {
        productOrder.quantity++;
      } else {
        newOrder.push({ productVariant, quantity: 1 });
      }
      return newOrder;
    });
  };

  return (
    <Card withBorder>
      <Flex gap="lg" justify="space-between">
        <Box>
          <Text>{productVariant.product.brand}</Text>
          <Text fz="lg" fw="bold">
            {productVariant.product.name}
          </Text>
          <Text display="inline-block">
            {
              productVariant.details.find((pv) => pv.attribute === "width")
                ?.value
            }
          </Text>
          <Text display="inline-block">
            /
            {
              productVariant.details.find(
                (pv) => pv.attribute === "aspectRatio"
              )?.value
            }
          </Text>
          &nbsp;
          <Text display="inline-block">
            R
            {
              productVariant.details.find(
                (pv) => pv.attribute === "rimDiameter"
              )?.value
            }
          </Text>
        </Box>
        <Flex gap="xs" direction="column" align="center">
          <Button variant="default" onClick={increment}>
            +
          </Button>
          <Text c="blue" fw="bold">
            {quantity}
          </Text>
          <Button variant="default" onClick={decrement}>
            -
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
};
