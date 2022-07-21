import { Box, Button, Spinner, Text } from "@chakra-ui/react";
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

  if (isFetching || !isClient) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  return (
    <Layout>
      {!isConnected && (
        <Text>Click Connect Wallet to begin. Burner wallet provides the best experience.</Text>
      )}
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
      <Box mt="2">
        <Video animationUrl="/promoVid.mp4" autoPlay controls muted playsInline></Video>
      </Box>
      <Text>A classic game, reimagined on the zero-gas SKALE network </Text>
      <Text>Find someone to play against, choose an item, scan a QR code.</Text>
      <Text>If you win, you get their item.</Text>
      <Text>Collect all the items to win $2022 in prizes.</Text>
    </Layout>
  );
}
