import { Box, Container, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import { SearchForm } from '@/components/flights/SearchForm';

export default function Home() {
  return (
    <Box minH="100vh" bg="gray.50" px={{ base: '4', md: '8' }}>
      <Flex minH="100vh" align="center" justify="center">
        <Container maxW="3xl" py={{ base: '8', md: '16' }}>
          <VStack gap={{ base: '8', md: '12' }} align="stretch">
            <VStack gap="3" align="center">
              <Heading as="h1" size="4xl" color="blue.600">
                Viyahe
              </Heading>
              <Text fontSize="xl" color="gray.600">
                Corporate Travel Booking
              </Text>
            </VStack>

            <SearchForm />
          </VStack>
        </Container>
      </Flex>
    </Box>
  );
}
