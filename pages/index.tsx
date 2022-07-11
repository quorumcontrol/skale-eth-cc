import { Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useInventory } from "../src/hooks/useGameItems";
import Layout from "../src/layouts/Layout";

export default function Home() {
  const { address, isConnected } = useAccount()
  const { data:tokens, isFetching} = useInventory()
  const router = useRouter()

  if (!isConnected) {
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


  if (address && tokens?.length === 0) {
    return router.push('/signup')
  }

  router.push('/inventory')
}
