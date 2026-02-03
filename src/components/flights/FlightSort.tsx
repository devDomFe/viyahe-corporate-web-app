"use client";

import { Flex, Text, createListCollection } from "@chakra-ui/react";
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from "@chakra-ui/react/select";
import type { FlightSortOption } from "@/types/flight";

const sortOptions = createListCollection({
  items: [
    { value: "best_value", label: "Best Value" },
    { value: "price_low", label: "Price: Low to High" },
    { value: "price_high", label: "Price: High to Low" },
    { value: "duration_short", label: "Duration: Shortest" },
    { value: "duration_long", label: "Duration: Longest" },
    { value: "departure_early", label: "Departure: Earliest" },
    { value: "departure_late", label: "Departure: Latest" },
  ],
});

interface FlightSortProps {
  value: FlightSortOption;
  onChange: (value: FlightSortOption) => void;
  resultCount: number;
}

export function FlightSort({ value, onChange, resultCount }: FlightSortProps) {
  return (
    <Flex justify="space-between" align="center" gap="4" flexWrap="wrap">
      <Text color="gray.600">
        <Text as="span" fontWeight="bold">
          {resultCount}
        </Text>{" "}
        {resultCount === 1 ? "flight" : "flights"} found
      </Text>

      <Flex align="center" gap="2">
        <Text fontSize="sm" color="gray.600">
          Sort by:
        </Text>
        <SelectRoot
          collection={sortOptions}
          value={[value]}
          onValueChange={(e) => onChange(e.value[0] as FlightSortOption)}
          size="sm"
          w="200px"
        >
          <SelectTrigger>
            <SelectValueText placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.items.map((item) => (
              <SelectItem key={item.value} item={item}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Flex>
    </Flex>
  );
}
