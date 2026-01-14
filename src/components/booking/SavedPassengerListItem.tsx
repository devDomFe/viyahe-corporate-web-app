'use client';

import { Box, Flex, Text, Badge } from '@chakra-ui/react';
import type { SavedPassenger } from '@/types/saved-passenger';
import { getPassengerDisplayName } from '@/types/saved-passenger';

interface SavedPassengerListItemProps {
  passenger: SavedPassenger;
  onSelect: (passenger: SavedPassenger) => void;
  isDisabled?: boolean;
  isAdded?: boolean;
}

export function SavedPassengerListItem({
  passenger,
  onSelect,
  isDisabled = false,
  isAdded = false,
}: SavedPassengerListItemProps) {
  const displayName = getPassengerDisplayName(passenger);

  const handleClick = () => {
    if (!isDisabled && !isAdded) {
      onSelect(passenger);
    }
  };

  return (
    <Box
      px="3"
      py="3"
      cursor={isDisabled || isAdded ? 'default' : 'pointer'}
      bg={isAdded ? 'blue.50' : 'white'}
      borderRadius="md"
      transition="all 0.15s"
      opacity={isDisabled ? 0.5 : 1}
      _hover={
        !isDisabled && !isAdded
          ? { bg: 'gray.50' }
          : undefined
      }
      onClick={handleClick}
      borderWidth="1px"
      borderColor={isAdded ? 'blue.200' : 'transparent'}
    >
      <Flex justify="space-between" align="start" gap="2">
        <Box flex="1" minW="0">
          <Text
            fontWeight="medium"
            fontSize="sm"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            color={isAdded ? 'blue.700' : 'gray.800'}
          >
            {displayName}
          </Text>
          <Text
            fontSize="xs"
            color="gray.500"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {passenger.email}
          </Text>
        </Box>
        {isAdded && (
          <Badge colorPalette="blue" size="sm" flexShrink={0}>
            Added
          </Badge>
        )}
      </Flex>
    </Box>
  );
}
