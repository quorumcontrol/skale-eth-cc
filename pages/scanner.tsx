import { Spinner, Text } from "@chakra-ui/react";
import {
  useCommitment, useDoBattle,
} from "../src/hooks/useBattle";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";
import AppLink from "../src/components/AppLink";
import { OnResultFunction, QrReader } from 'react-qr-reader';
import { defaultAbiCoder } from "ethers/lib/utils";
import { useCallback, useState } from "react";

export default function Scanner() {
  const [loading, setLoading] = useState(false)
  const { data: commitment, isFetching } = useCommitment();
  const isClient = useIsClientSide();
  const doBattle = useDoBattle()

  const onResult:OnResultFunction = useCallback(async (result) => {
    if (!result || result.getNumBits() === 0) {
      return null
    }
    console.log('got a battle')
    setLoading(true)
    try {
      const [address, salt, tokenId] = defaultAbiCoder.decode(['address', 'bytes32', 'uint256'], result.getRawBytes())
      await doBattle.mutateAsync({
        opponentAddr: address,
        opponentSalt: salt,
        opponentTokenid: tokenId,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  if (!isClient || loading) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  if (isFetching) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  if (!commitment || !commitment.isCommitted) {
    return (
      <Layout>
        <Text>Looks like you haven't chosen an item yet.</Text>
        <AppLink href="/inventory">Go back to inventory.</AppLink>
      </Layout>
    );
  }

  return (
    <Layout>
      <Text>Scan your opponents QR code.</Text>
      {isClient && <QrReader
      containerStyle={{width: '100%', height: '100%'}}
    ViewFinder={() => <Text>hi</Text>}
    constraints={{
      facingMode: 'user'
    }}
    onResult={onResult}
  />}
  </Layout>
  );
}
