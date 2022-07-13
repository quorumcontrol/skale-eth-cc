import { Box, Text } from "@chakra-ui/react";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";
import { useAccount } from "wagmi";
import PaddedQRCode from "../src/components/PaddedQRCode";
import { useCallback } from "react";
import { useRouter } from "next/router";
import { useOnSignedUp } from "../src/hooks/useGameItems";

export default function Inventory() {
  const { address } = useAccount()
  const isClient = useIsClientSide()
  const router = useRouter()
  const onSignedUp = useCallback(() => {
    router.push('/inventory')
  }, [router])
  useOnSignedUp(onSignedUp)

  return (
    <Layout>
      <Text>You need an invite code to signup.</Text>
      {isClient && address && (
        <PaddedQRCode value={address} />
      ) }
      <Text>An organizer can scan this code to get you setup.</Text>
    </Layout>
  )
}
