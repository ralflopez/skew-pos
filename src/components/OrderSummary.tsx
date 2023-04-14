import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Radio,
  Space,
  Text,
} from "@mantine/core";
import { useAtomValue } from "jotai";
import React from "react";
import { orderAtom } from "./posStates";
import { OrderItem } from "./OrderItem";
import { currencyFormatter } from "~/config/formatter";

export const OrderSummary = () => {
  const orders = useAtomValue(orderAtom);

  return (
    <Flex h="100%" direction="column" sx={{ overflow: "auto" }}>
      <Box>
        <Text fw="bold" fz="lg">
          Order
        </Text>
        <Space h="sm" />
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: "0px",
          overflow: "auto",
        }}
      >
        {orders.map((order) => (
          <OrderItem key={order.productVariant.sku} order={order} />
        ))}
      </Box>
      <Box mb="xs">
        <Divider my="sm" variant="dotted" />
        <Flex justify="space-between" align="center">
          <Text fw="bold">Total</Text>
          <Text fw="bold">
            {currencyFormatter.format(
              orders.reduce(
                (acc, order) =>
                  (acc += order.quantity * order.productVariant.price),
                0
              )
            )}
          </Text>
        </Flex>
        <Divider my="sm" />
        <Radio.Group
          name="paymentMethod"
          label="Payment Method"
          withAsterisk
          defaultValue="cash"
        >
          <Group mt="xs">
            <Radio value="cash" label="Cash" />
            <Radio value="creditCard" label="Credit Card" />
            <Radio value="gcash" label="Gcash" />
          </Group>
        </Radio.Group>
        <Space h="lg" />
        <Button fullWidth>Checkout</Button>
      </Box>
    </Flex>
  );
};
