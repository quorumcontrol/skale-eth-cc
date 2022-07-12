import { Spinner, Text } from "@chakra-ui/react";
import { useCommitment, useDoBattle } from "../src/hooks/useBattle";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";
import AppLink from "../src/components/AppLink";
import { OnResultFunction, QrReader } from "react-qr-reader";
import { defaultAbiCoder, solidityKeccak256 } from "ethers/lib/utils";
import { useCallback, useState } from "react";
import { useRouter } from "next/router";

export default function Scanner() {
  const [loading, setLoading] = useState(false);
  const { data: commitment, isFetching } = useCommitment();
  const isClient = useIsClientSide();
  const doBattle = useDoBattle();
  const router = useRouter()

  const onResult: OnResultFunction = useCallback(async (result) => {
    if (!result || result.getNumBits() === 0) {
      return null;
    }
    console.log("got a battle");
    if (loading) {
      return
    }
    setLoading(true);
    try {
      console.log('qr scan:', result.getText())
      const [address, salt, tokenId] = defaultAbiCoder.decode(
        ["address", "bytes32", "uint256"],
        result.getText()
      );
      console.log('would be a commit of: ', solidityKeccak256(['bytes32', 'uint256'], [salt, tokenId]))
      const receipt = await doBattle.mutateAsync({
        opponentAddr: address,
        opponentSalt: salt,
        opponentTokenid: tokenId,
      });
      await router.push(`/battleComplete/${receipt.transactionHash}`)
    } finally {
      setLoading(false);
    }
  }, [doBattle, loading]);

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
      {isClient && (
        <QrReader
          containerStyle={{ width: "100%", height: "100%" }}
          constraints={{
            facingMode: "user",
          }}
          onResult={onResult}
        />
      )}
    </Layout>
  );
}
