import QRCode from "react-qr-code";
import { Box, Text } from "@chakra-ui/react";
import NFTCard from "../src/components/NFTCard";
import { useInventory } from "../src/hooks/useGameItems";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";
import { useAccount } from "wagmi";

export default function Inventory() {
  const { address } = useAccount()
  const isClient = useIsClientSide()

  return (
    <Layout>
      <Text>You need an invite code to signup.</Text>
      {isClient && address && (
        <Box backgroundColor="white" p="16px">
          <QRCode value={address} />
        </Box>) }
      <Text>An organizer can scan this code to get you setup.</Text>
    </Layout>
  )
}
