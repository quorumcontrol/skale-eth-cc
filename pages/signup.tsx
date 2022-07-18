import { Box, Text } from "@chakra-ui/react";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";
import { useAccount } from "wagmi";
import PaddedQRCode from "../src/components/PaddedQRCode";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { useInventory, useOnSignedUp } from "../src/hooks/useGameItems";

export default function Inventory() {
  const { address } = useAccount()
  const isClient = useIsClientSide()
  const { data: tokens } = useInventory();
  const router = useRouter()
  
  const onSignedUp = useCallback(() => {
    router.push('/inventory')
  }, [router])

  useOnSignedUp(onSignedUp)

  useEffect(() => {
    if (isClient && tokens && tokens.length > 0) {
      onSignedUp()
    }
  }, [tokens, isClient, onSignedUp])

  return (
    <Layout>
      <Text>You need an invite to signup.</Text>
      {isClient && address && (
        <PaddedQRCode value={address} />
      ) }
      <Text>A keymaster can scan this code to get you setup.</Text>
    </Layout>
  )
}
