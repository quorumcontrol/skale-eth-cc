import { Button, Spinner, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import {
  useEncodedCommitmentData,
  useOnBattleComplete,
  useSaltTransactionFinder,
} from "../../../../src/hooks/useBattle";
import useIsClientSide from "../../../../src/hooks/useIsClientSide";
import Layout from "../../../../src/layouts/Layout";
import AppLink from "../../../../src/components/AppLink";
import PaddedQRCode from "../../../../src/components/PaddedQRCode";
import { useWaitForTransaction } from "wagmi";

export default function Battle() {
  const router = useRouter();
  const { salt, transactionHash, tokenId } = router.query;
  const { data:receipt, isLoading } = useWaitForTransaction({
    hash: transactionHash as string,
  });
  
  const qrData = useEncodedCommitmentData(
    transactionHash as string,
    parseInt(tokenId as string, 10),
    salt as string
  );
  const isClient = useIsClientSide();

  const { data: saltTx } = useSaltTransactionFinder(salt as string);

  const onBattleComplete = useCallback(
    (...args: any) => {
      console.log("battle complete: ", args);
      const evt = args[args.length - 1];
      router.push(`/battleComplete/${evt.transactionHash}`);
    },
    [router]
  );
  useOnBattleComplete(salt as string, onBattleComplete);

  if (!isClient) {
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
    );
  }

  return (
    <Layout>
      <Text>Battle</Text>
      <PaddedQRCode value={qrData || ""} />
      {isLoading && <Spinner />}
      {receipt && receipt.status == 0 && <Text>Something went wrong with that transaction.</Text>}
      <Text>
        Prefer to scan your opponent?{" "}
        <AppLink href="/scanner">Click here.</AppLink>
      </Text>
    </Layout>
  );
}
