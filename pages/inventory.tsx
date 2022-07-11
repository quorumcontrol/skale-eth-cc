import { Text } from "@chakra-ui/react";
import NFTCard from "../src/components/NFTCard";
import { useInventory } from "../src/hooks/useGameItems";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";

export default function Inventory() {
  const { data: tokens } = useInventory()
  const isClient = useIsClientSide()

  return (
    <Layout>
      <Text>Inventory</Text>
      {isClient && tokens && tokens.length == 0 && (
        <Text>Looks like you have no items, you'll need to get an invite code.</Text>
      )}
      {
        isClient && tokens && tokens.map((token) => {
          return <NFTCard item={token} key={`inventory-card-${token.tokenId}`}/>
        })
      }
    </Layout>
  )
}
