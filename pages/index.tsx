import { Box, Button, Heading, Spinner, Text } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import NextLink from "next/link";
import { useInventory } from "../src/hooks/useGameItems";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";
import Video from "../src/components/Video";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: tokens, isFetching } = useInventory();
  const isClient = useIsClientSide();

  if (!isClient || !isConnected) {
    return (
      <Layout>
        <Text>Connect your wallet to begin</Text>
      </Layout>
    );
  }

  if (isFetching) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  return (
    <Layout>
      {isClient && address && tokens?.length === 0 && (
        <NextLink href="/signup">
          <Button>Signup</Button>
        </NextLink>
      )}
      {isClient && address && (tokens?.length || 0) > 0 && (
        <NextLink href="/inventory">
          <Button>Play</Button>
        </NextLink>
      )}
      <Box>
        <Video animationUrl="/promoVid.mp4" autoPlay controls muted></Video>
      </Box>
      <Text>A classic game, reimagined on the zero-gas SKALE network </Text>
      <Text>Find someone to play against, choose an item, scan a QR code.</Text>
      <Text>If you win, you get their item.</Text>
      <Text>Collect all the items to win $2022 in prizes.</Text>
    </Layout>
  );
}
