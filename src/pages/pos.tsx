import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  LoadingOverlay,
  Radio,
  SimpleGrid,
  Space,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Product } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Category, CategorySelector } from "~/components/CategorySelector";
import { OrderSummary } from "~/components/OrderSummary";
import { ProductCard } from "~/components/ProductCard";
import { api } from "~/utils/api";
import { useSetAtom } from "jotai";
import { categoriesAtom, productsAtom } from "~/components/posStates";
import { ProductSelector } from "~/components/ProductSelector";

const POS = () => {
  const { data, isLoading, isError } = api.product.getAll.useQuery();
  const setCategories = useSetAtom(categoriesAtom);
  const setProducts = useSetAtom(productsAtom);

  useEffect(() => {
    if (data) {
      const allBrands = data.map((c) => c.brand);
      const filteredBrands = allBrands.filter(
        (item, index) => allBrands.indexOf(item) === index
      );

      const brandsAndCount = filteredBrands.map((brand) => ({
        name: brand,
        itemCount: data.filter((c) => c.brand === brand).length,
      }));

      setCategories(brandsAndCount);
      setProducts(data);
    }
  }, [data, setCategories, setProducts]);

  if (isError) return <div>Error lol</div>;

  return (
    <Container fluid p={0} m={0} h="100vh">
      <LoadingOverlay visible={isLoading} />
      <Grid m={0} h="100%">
        <Grid.Col xs={12} md={9} h="100%" sx={{ overflow: "auto" }}>
          <CategorySelector />
          <Space h="lg" />
          <Divider variant="dashed" />
          <Space h="sm" />
          <ProductSelector />
          <Space h="sm" />
        </Grid.Col>
        <Grid.Col
          display={{
            md: "block",
          }}
          span={3}
          h="100%"
          sx={{ overflow: "auto", display: "none" }}
        >
          <OrderSummary />
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default POS;
