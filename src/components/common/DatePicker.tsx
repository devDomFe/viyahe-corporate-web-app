'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Button, Flex, Grid, Input, Text, IconButton } from '@chakra-ui/react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  minDate?: string; // YYYY-MM-DD format
  placeholder?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DatePicker({ value, onChange, minDate, placeholder = 'Select date' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    if (minDate) return new Date(minDate);
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : null;
  const minDateObj = minDate ? new Date(minDate) : null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const isDateDisabled = (day: number): boolean => {
    if (!minDateObj) return false;
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    minDateObj.setHours(0, 0, 0, 0);
    return date < minDateObj;
  };

  const isDateSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === year &&
      selectedDate.getMonth() === month &&
      selectedDate.getDate() === day
    );
  };

  const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Box position="relative" ref={containerRef}>
      <Input
        readOnly
        value={value ? formatDisplayDate(value) : ''}
        placeholder={placeholder}
        onClick={() => setIsOpen(!isOpen)}
        cursor="pointer"
        size="lg"
        px="4"
        h="12"
        bg="white"
      />

      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left="0"
          mt="2"
          bg="white"
          borderRadius="lg"
          boxShadow="xl"
          border="1px solid"
          borderColor="gray.200"
          zIndex="dropdown"
          p="3"
          minW="260px"
        >
          {/* Header */}
          <Flex justify="space-between" align="center" mb="3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              px="2"
            >
              ←
            </Button>
            <Text fontWeight="bold" fontSize="md">
              {MONTHS[month]} {year}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              px="2"
            >
              →
            </Button>
          </Flex>

          {/* Day headers */}
          <Grid templateColumns="repeat(7, 1fr)" gap="0" mb="1">
            {DAYS.map((day) => (
              <Box
                key={day}
                textAlign="center"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                py="1"
              >
                {day}
              </Box>
            ))}
          </Grid>

          {/* Calendar days */}
          <Grid templateColumns="repeat(7, 1fr)" gap="0">
            {calendarDays.map((day, index) => (
              <Box key={index} textAlign="center">
                {day !== null ? (
                  <Button
                    variant={isDateSelected(day) ? 'solid' : 'ghost'}
                    colorPalette={isDateSelected(day) ? 'blue' : 'gray'}
                    size="sm"
                    w="32px"
                    h="32px"
                    fontSize="sm"
                    disabled={isDateDisabled(day)}
                    onClick={() => handleSelectDate(day)}
                    opacity={isDateDisabled(day) ? 0.4 : 1}
                    _hover={!isDateDisabled(day) ? { bg: isDateSelected(day) ? 'blue.600' : 'gray.100' } : {}}
                  >
                    {day}
                  </Button>
                ) : (
                  <Box w="32px" h="32px" />
                )}
              </Box>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
