import { Spinner, Text } from "@chakra-ui/react";
import {
  useCommitment,
  useEncodedCommitmentData,
  useOnBattleComplete,
} from "../src/hooks/useBattle";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";
import AppLink from "../src/components/AppLink";
import PaddedQRCode from "../src/components/PaddedQRCode";
import { useCallback } from "react";
import { useRouter } from "next/router";

export default function Battle() {
  const { data: commitment, isFetching } = useCommitment();
  const qrData = useEncodedCommitmentData();
  const isClient = useIsClientSide();
  const router = useRouter()

  const onBattleComplete = useCallback((...args:any) => {
    console.log('battle complete: ', args)
    const evt = args.slice(-1)
    console.log('evt: ', evt)
    router.push(`/battleComplete/${evt.transactionHash}`)
  }, [])
  useOnBattleComplete(onBattleComplete)

  if (!isClient) {
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
        <Text>Looks like you haven&apos;t chosen an item yet.</Text>
        <AppLink href="/inventory">Go back to inventory.</AppLink>
      </Layout>
    );
  }

  return (
    <Layout>
      <Text>Battle</Text>
      <PaddedQRCode value={qrData || ''} />
      <Text>Prefer to scan your opponent? <AppLink href="/scanner">Click here.</AppLink></Text>
    </Layout>
  );
}
