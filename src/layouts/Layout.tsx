import React from "react";
import {
  Container,
  VStack,
  Box,
  Heading,
  Stack,
  Spacer,
  Text,
  LinkBox,
  LinkOverlay,
  Image
} from "@chakra-ui/react";
import NextLink from "next/link";
import logo from "../assets/gameLogo.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import AppLink from "../components/AppLink";
import { useCanOnboard } from "../hooks/useGameItems";
import useIsClientSide from "../hooks/useIsClientSide";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data:canOnboard } = useCanOnboard()
  const isClient = useIsClientSide()

  return (
    <Container p={10} maxW="1200">
      <Stack direction={["column", "row"]} spacing="5">
        <LinkBox>
          <NextLink href="/" passHref>
            <LinkOverlay flexDir="row" display="flex" alignItems="center">
              <Image src={logo.src} alt="Crypto Colosseum logo" width={['50px', '50px', '100px', '100px']} height={['50px', '50px', '100px', '100px']} />
              <Heading size="sm" ml="5">
                Skale, Paper, Scissors
              </Heading>
            </LinkOverlay>
          </NextLink>
        </LinkBox>
        <Spacer display={['none', 'none', 'block', 'block']} />
        { isClient && canOnboard && <AppLink pt="2" href="/onboard">Onboard</AppLink> }
        <Box ml="5">
          <ConnectButton showBalance={false} />
        </Box>
      </Stack>

      <VStack mt="10" spacing={5}>
        {children}
      </VStack>
      <Box as="footer" mt="200" textAlign="center">
        <Text fontSize="sm">
            Created by ...
        </Text>
      </Box>
    </Container>
  );
};

export default Layout;
