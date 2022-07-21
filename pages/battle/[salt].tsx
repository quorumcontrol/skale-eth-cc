import { Button, Spinner, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { useRouter } from "next/router";
import NextLink from 'next/link';
import {
  useCommitment,
  useEncodedCommitmentData,
  useOnBattleComplete,
  useSaltTransactionFinder,
} from "../../src/hooks/useBattle";
import useIsClientSide from "../../src/hooks/useIsClientSide";
import Layout from "../../src/layouts/Layout";
import AppLink from "../../src/components/AppLink";
import PaddedQRCode from "../../src/components/PaddedQRCode";


export default function Battle() {
  const router = useRouter()
  const { salt } = router.query
  const { data: commitment, isFetching } = useCommitment();
  const qrData = useEncodedCommitmentData();
  const isClient = useIsClientSide();

  const { data:saltTx } = useSaltTransactionFinder(salt as string)

  const onBattleComplete = useCallback((...args:any) => {
    console.log('battle complete: ', args)
    const evt = args[args.length - 1]
    router.push(`/battleComplete/${evt.transactionHash}`)
  }, [router])
  useOnBattleComplete(salt as string, onBattleComplete)

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

  if (saltTx) {
    return (
      <Layout>
        <Text>Battle Complete</Text>
        <NextLink href={`/battleComplete/${saltTx}`}>
          <Button>See results</Button>
        </NextLink>
      </Layout>
    )
  }

  if (!commitment || (!commitment.isCommitted && !commitment.transactionHash)) {
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
