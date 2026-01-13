'use client';

import { Box, Flex, createListCollection } from '@chakra-ui/react';
import {
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from '@chakra-ui/react/select';

interface DateOfBirthInputProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
}

const months = createListCollection({
  items: [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ],
});

// Generate days 1-31
const days = createListCollection({
  items: Array.from({ length: 31 }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    return { value: day, label: String(i + 1) };
  }),
});

// Generate years from current year back to 1920
const currentYear = new Date().getFullYear();
const years = createListCollection({
  items: Array.from({ length: currentYear - 1920 + 1 }, (_, i) => {
    const year = String(currentYear - i);
    return { value: year, label: year };
  }),
});

export function DateOfBirthInput({ value, onChange }: DateOfBirthInputProps) {
  // Parse the current value
  const [year, month, day] = value ? value.split('-') : ['', '', ''];

  const handleChange = (field: 'year' | 'month' | 'day', newValue: string) => {
    let newYear = year;
    let newMonth = month;
    let newDay = day;

    if (field === 'year') newYear = newValue;
    if (field === 'month') newMonth = newValue;
    if (field === 'day') newDay = newValue;

    // Only update if we have all three parts
    if (newYear && newMonth && newDay) {
      onChange(`${newYear}-${newMonth}-${newDay}`);
    } else {
      // Store partial value for form state
      onChange(`${newYear || ''}-${newMonth || ''}-${newDay || ''}`);
    }
  };

  const selectItemStyles = {
    px: '3',
    py: '2',
    borderRadius: 'md',
    cursor: 'pointer',
    _hover: { bg: 'gray.100' },
  };

  return (
    <Flex gap="3">
      {/* Month */}
      <Box flex="2">
        <SelectRoot
          collection={months}
          value={month ? [month] : []}
          onValueChange={(e) => handleChange('month', e.value[0])}
          size="lg"
        >
          <SelectTrigger h="12" px="4">
            <SelectValueText placeholder="Month" />
          </SelectTrigger>
          <SelectContent bg="white" borderRadius="md" boxShadow="lg" p="1" maxH="250px">
            {months.items.map((item) => (
              <SelectItem key={item.value} item={item} {...selectItemStyles}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Box>

      {/* Day */}
      <Box flex="1">
        <SelectRoot
          collection={days}
          value={day ? [day] : []}
          onValueChange={(e) => handleChange('day', e.value[0])}
          size="lg"
        >
          <SelectTrigger h="12" px="4">
            <SelectValueText placeholder="Day" />
          </SelectTrigger>
          <SelectContent bg="white" borderRadius="md" boxShadow="lg" p="1" maxH="250px">
            {days.items.map((item) => (
              <SelectItem key={item.value} item={item} {...selectItemStyles}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Box>

      {/* Year */}
      <Box flex="1.5">
        <SelectRoot
          collection={years}
          value={year ? [year] : []}
          onValueChange={(e) => handleChange('year', e.value[0])}
          size="lg"
        >
          <SelectTrigger h="12" px="4">
            <SelectValueText placeholder="Year" />
          </SelectTrigger>
          <SelectContent bg="white" borderRadius="md" boxShadow="lg" p="1" maxH="250px">
            {years.items.map((item) => (
              <SelectItem key={item.value} item={item} {...selectItemStyles}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
      </Box>
    </Flex>
  );
}
