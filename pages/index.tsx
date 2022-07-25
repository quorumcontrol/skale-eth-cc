import { Box, Button, Spinner, Text } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import NextLink from "next/link";
import { useDoSignup, useInventory } from "../src/hooks/useGameItems";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";
import Video from "../src/components/Video";
import { useCallback, useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { address, isConnected } = useAccount();
  const { data: tokens, isFetching } = useInventory();
  const isClient = useIsClientSide();
  const doSignup = useDoSignup()

  const handleSignupClick = useCallback(async () => {
    if (!address) {
      return
    }
    setLoading(true)
    try {
      const resp = await doSignup.mutateAsync({ address })
      if (resp.status !== 201) {
        console.error('bad response: ', resp)
        throw new Error('bad response')
      }
      const { transactionHash } = await resp.json()
      router.push(`/inventory?transactionHash=${transactionHash}`)
    } catch (err) {
      console.error("error fetching: ", err)
    } finally {
      setLoading(false)
    }

  }, [doSignup, address, router])

  if (isFetching || !isClient || loading) {
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
        <Button onClick={handleSignupClick}>Signup</Button>
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
