import { Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NFTCard from "../src/components/NFTCard";
import { useCommitment, useDoCommit } from "../src/hooks/useBattle";
import { useInventory } from "../src/hooks/useGameItems";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";

export default function Inventory() {
  const [loading, setLoading] = useState(false)
  const { data: tokens } = useInventory()
  const isClient = useIsClientSide()
  const { data:commitment } = useCommitment()
  const commit = useDoCommit()
  const router = useRouter()

  useEffect(() => {
    if (commitment && commitment.isCommitted) {
      router.push('/battle')
    }
  }, [commitment])

  const onChoose = async (tokenId:number) => {
    setLoading(true)
    try {
      const receipt = await commit.mutateAsync(tokenId)
      console.log('commit receipt: ', receipt)
      await router.push('/battle')
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    )
  }

  return (
    <Layout>
      <Text>Inventory</Text>
      {isClient && tokens && tokens.length == 0 && (
        <Text>Looks like you have no items, you'll need to get an invite code.</Text>
      )}
      {
        isClient && tokens && tokens.map((token) => {
          return <NFTCard item={token} key={`inventory-card-${token.tokenId}`} onChoose={onChoose} />
        })
      }
    </Layout>
  )
}
