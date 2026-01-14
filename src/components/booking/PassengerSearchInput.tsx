'use client';

import { useState, useEffect } from 'react';
import { Box, Input } from '@chakra-ui/react';

interface PassengerSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PassengerSearchInput({
  value,
  onChange,
  placeholder = 'Search passengers...',
}: PassengerSearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the onChange callback
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <Box>
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        size="md"
        bg="white"
        borderColor="gray.300"
        px="4"
        _hover={{ borderColor: 'gray.400' }}
        _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
      />
    </Box>
  );
}
