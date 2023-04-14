import {
  ActionIcon,
  Button,
  Flex,
  Pagination,
  Select,
  Space,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { IconDots, IconTrash, IconSearch } from "@tabler/icons-react";
import React, { useState } from "react";

const Products = () => {
  const [activePage, setPage] = useState(1);

  return (
    <>
      <Title bottom="sm">Products</Title>
      <Space h="sm" />
      <Flex justify="space-between">
        <Flex align="flex-end" gap="xs">
          <TextInput placeholder="Search" />
          <Select
            placeholder="Brand"
            data={[
              { value: "brand", label: "Brand" },
              { value: "name", label: "Name" },
              { value: "price", label: "Price" },
              { value: "width", label: "Width" },
              { value: "aspectRatio", label: "Aspect Ratio" },
              { value: "rimDiameter", label: "Rim Diameter" },
            ]}
          />
          <ActionIcon color="blue" size="lg" variant="filled">
            <IconSearch />
          </ActionIcon>
        </Flex>
        <Flex>
          <Button>Add</Button>
        </Flex>
      </Flex>
      <Space h="sm" />
      <Table striped withBorder>
        <thead>
          <tr>
            <th>Brand</th>
            <th>Name</th>
            <th>Price</th>
            <th>Width</th>
            <th>Aspect Ratio</th>
            <th>Rim Diameter</th>
            <th>{""}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Michelin</td>
            <td>Name</td>
            <td>P 200.00</td>
            <td>20</td>
            <td>20</td>
            <td>20</td>
            <td>
              <Flex gap="sm">
                <ActionIcon size="lg" variant="default">
                  <IconDots size="1.625rem" />
                </ActionIcon>
                <ActionIcon color="red" size="lg" variant="filled">
                  <IconTrash size="1.625rem" />
                </ActionIcon>
              </Flex>
            </td>
          </tr>
        </tbody>
      </Table>
      <Space h="sm" />
      <Flex justify="center">
        <Pagination value={activePage} onChange={setPage} total={10} />
      </Flex>
    </>
  );
};

export default Products;
