import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Grid,
  Group,
  Radio,
  SimpleGrid,
  Space,
  Text,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { categoriesAtom, selectedCategoryAtom } from "./posStates";
import { useSetAtom, useAtomValue } from "jotai";

export type Category = {
  name: string;
  itemCount: number;
};

export const CategorySelector = () => {
  const categories = useAtomValue(categoriesAtom);
  const selected = useAtomValue(selectedCategoryAtom);
  const setCategorySelected = useSetAtom(selectedCategoryAtom);

  const [itemsViewable, setItemsViewable] = useState<Category[][]>([]);

  useEffect(() => {
    const items: Category[][] = [];
    const allCategories = [
      {
        name: "ALL",
        itemCount: categories.reduce((acc, item) => acc + item.itemCount, 0),
      },
      { name: "Michelin", itemCount: 10 },
      { name: "Presa", itemCount: 12 },
      { name: "Maxxis", itemCount: 10 },
      { name: "Accelera", itemCount: 10 },
      { name: "CST", itemCount: 44 },
      { name: "Yokohama", itemCount: 4 },
      { name: "Continental", itemCount: 6 },
    ].concat(categories);

    const chunkSize = 8;
    for (let i = 0; i < allCategories.length; i += chunkSize) {
      const chunk = allCategories.slice(i, i + chunkSize);
      items.push(chunk);
    }

    setItemsViewable(items);
  }, [categories]);

  return (
    <>
      <Text fw="bold" fz="xl">
        Brands
      </Text>
      <Space h="sm" />
      <Carousel withControls={false} withIndicators={true}>
        {itemsViewable.map((item, i) => (
          <Carousel.Slide key={i}>
            <SimpleGrid
              breakpoints={[
                { cols: 1, minWidth: "xs" },
                { cols: 2, minWidth: "sm" },
                { cols: 4, minWidth: "md" },
              ]}
              spacing="xs"
              mr="xs"
            >
              {item.map((c) => (
                <Card
                  key={c.name}
                  withBorder
                  h="120px"
                  bg={selected === c.name ? "blue" : ""}
                  sx={{ cursor: "pointer" }}
                  onClick={() => setCategorySelected(c.name)}
                >
                  <Text>{c.name}</Text>
                  <Text>{c.itemCount} items</Text>
                </Card>
              ))}
            </SimpleGrid>
          </Carousel.Slide>
        ))}
      </Carousel>
    </>
  );
};
