import { Spinner, Text } from "@chakra-ui/react";
import NFTCard from "../src/components/NFTCard";
import {
  useCommitment,
  useEncodedCommitmentData,
} from "../src/hooks/useBattle";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";
import AppLink from "../src/components/AppLink";
import PaddedQRCode from "../src/components/PaddedQRCode";

export default function Battle() {
  const { data: commitment, isFetching } = useCommitment();
  const qrData = useEncodedCommitmentData();
  const isClient = useIsClientSide();

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
        <Text>Looks like you haven't chosen an item yet.</Text>
        <AppLink href="/inventory">Go back to inventory.</AppLink>
      </Layout>
    );
  }

  return (
    <Layout>
      <Text>Battle</Text>
      <PaddedQRCode value={qrData || ''} />
    </Layout>
  );
}
