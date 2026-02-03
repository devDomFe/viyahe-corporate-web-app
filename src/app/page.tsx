import Link from "next/link";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  HStack,
} from "@chakra-ui/react";
import { SearchForm } from "@/components/flights/SearchForm";
import { ClearActiveBooking } from "@/components/layout/ClearActiveBooking";

export default function Home() {
  return (
    <Box
      minH="100vh"
      bg="gray.50"
      px={{ base: "4", md: "8" }}
      pt={{ base: "4", md: "6" }}
    >
      {/* Clear active booking when on home page */}
      <ClearActiveBooking />

      {/* Top Navigation */}
      <Flex
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={{ base: "4", md: "8" }}
        py="3"
        justify="space-between"
        align="center"
        borderRadius="lg"
      >
        <Heading size="md" color="blue.600">
          Viyahe
        </Heading>
        <Link href="/passengers">
          <Button variant="ghost" size="sm">
            Manage Passengers
          </Button>
        </Link>
      </Flex>

      <Flex flex="1" align="center" justify="center">
        <Container maxW="3xl" py={{ base: "8", md: "16" }}>
          <VStack gap={{ base: "8", md: "12" }} align="stretch">
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
