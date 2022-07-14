import { Button, Heading, Spinner, Text } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import NextLink from 'next/link'
import { useInventory } from "../src/hooks/useGameItems";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";

export default function Home() {
  const { address, isConnected } = useAccount()
  const { data:tokens, isFetching} = useInventory()
  const isClient = useIsClientSide()

  if (!isClient || !isConnected) {
    return (
      <Layout>
        <Text>
          Connect your wallet to begin
        </Text>
      </Layout>
    )
  }

  if (isFetching) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    )
  }

  return (
    <Layout>
      <Heading>Welcome to Skale, Paper, Scissors</Heading>
      <Text>Collect all the items for prizes!</Text>
      <Text>Choose an item, find someone to play against, scan your codes. If you win, you get their item.</Text>
      { isClient && address && tokens?.length === 0 && (
        <NextLink href="/signup">
          <Button>Signup</Button>
        </NextLink>
      )}
      { isClient && address && (tokens?.length || 0) > 0 && (
        <NextLink href="/inventory">
          <Button>Play</Button>
        </NextLink>
      )}
    </Layout>
  )
}
