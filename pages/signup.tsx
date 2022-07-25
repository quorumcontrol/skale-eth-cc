import { Box, Button, Text } from "@chakra-ui/react";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";
import { useAccount } from "wagmi";
import PaddedQRCode from "../src/components/PaddedQRCode";
import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import NextLink from 'next/link'
import { useInventory, useOnSignedUp } from "../src/hooks/useGameItems";

export default function Inventory() {
  const { address } = useAccount()
  const isClient = useIsClientSide()
  const { data: tokens } = useInventory();
  const router = useRouter()

  const tweetHref = useMemo(() => {
    const text = `My tweet is my password. Verify me. #SKALEpaperscissors @RyanJLevy @fabiotomaschett @tobowers @SkaleNetwork\nme: ${address}`
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&original_referer=https://sps.calypsohub.network&related=skalenetwork`
  }, [address])
  
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
      <Text>Find a keymaster to play.</Text>
      <Text>Trouble finding a keymaster?</Text>
      <NextLink href={tweetHref} target="_blank">
        <Button>Tweet for access.</Button>
      </NextLink>
      {isClient && address && (
        <PaddedQRCode value={address} />
      ) }
      <Text>The Keymaster will scan the above code.</Text>
    </Layout>
  )
}
