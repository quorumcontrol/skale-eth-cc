import React, { useEffect, useState } from "react";
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
  Image,
  Spinner
} from "@chakra-ui/react";
import NextLink from "next/link";
import logo from "../assets/gameLogo.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import AppLink from "../components/AppLink";
import { useCanOnboard } from "../hooks/useGameItems";
import useIsClientSide from "../hooks/useIsClientSide";
import { useRouter } from "next/router";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data:canOnboard } = useCanOnboard()
  const isClient = useIsClientSide()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleStart = (url:string) => (url !== router.asPath) && setLoading(true);
    const handleComplete = (url:string) => (url === router.asPath) && setLoading(false);

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
        router.events.off('routeChangeStart', handleStart)
        router.events.off('routeChangeComplete', handleComplete)
        router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  return (
    <Container p={10} maxW="1200">
      <Stack direction={["column", "row"]} spacing="5">
        <LinkBox>
          <NextLink href="/" passHref>
            <LinkOverlay flexDir="row" display="flex" alignItems="center">
              <Image src={logo.src} alt="SKALE, Paper, Scissors logo" width={['50px', '50px', '100px', '100px']} height={['50px', '50px', '100px', '100px']} />
              <Heading size="sm" ml="5">
                SKALE, Paper, Scissors
              </Heading>
            </LinkOverlay>
          </NextLink>
        </LinkBox>
        <Spacer display={['none', 'none', 'block', 'block']} />
        { isClient && canOnboard && <AppLink pt="1.5" href="/onboard">Onboard</AppLink> }
        <AppLink pt="1.5" href="/about">About</AppLink>
        <Box ml="5">
          <ConnectButton showBalance={false} />
        </Box>
      </Stack>

      <VStack mt="10" spacing={5}>
        {!loading && children}
        {loading && <Spinner />}
      </VStack>
      <Box as="footer" mt="200" textAlign="center">
        <Text fontSize="sm">
            Lovingly created by a group of builders from the #skaleverse.
        </Text>
      </Box>
    </Container>
  );
};

export default Layout;
