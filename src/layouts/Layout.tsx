import React from "react";
import {
  Container,
  VStack,
  Box,
  Heading,
  Stack,
  Spacer,
  Text,
  Link,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import logo from "../assets/gameLogo.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Container p={10} maxW="1200">
      <Stack direction={["column", "row"]} spacing="5">
        <LinkBox>
          <NextLink href="/" passHref>
            <LinkOverlay flexDir="row" display="flex" alignItems="center">
              <Image src={logo} alt="Crypto Colosseum logo" width="100px" height="100px"/>
              <Heading size="sm" ml="5">
                Block, Paper, Scissors
              </Heading>
            </LinkOverlay>
          </NextLink>
        </LinkBox>
        <Spacer />
        <Box ml="5">
          <ConnectButton showBalance={false} />
        </Box>
      </Stack>

      <VStack mt="10" spacing={5}>
        {children}
      </VStack>
      <Box as="footer" mt="200" textAlign="center">
        <Text fontSize="sm">
          <Link href="https://larvamaiorum.com/">
            A Crypto Colosseum: Larva Maiorum experience.
          </Link>
        </Text>
      </Box>
    </Container>
  );
};

export default Layout;
