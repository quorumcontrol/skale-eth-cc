import { Text } from "@chakra-ui/react";
import NFTCard from "../src/components/NFTCard";
import { useInventory } from "../src/hooks/useGameItems";
import Layout from "../src/layouts/Layout";

export default function Inventory() {
  const { data: tokens } = useInventory()

  return (
    <Layout>
      <Text>Inventory</Text>
      {tokens && tokens.length == 0 && (
        <Text>Looks like you have no items, you'll need to get an invite code.</Text>
      )}
      {
        tokens && tokens.map((token) => {
          return <NFTCard item={token} key={`inventory-card-${token.tokenId}`}/>
        })
      }
    </Layout>
  )
}
