import { Spinner, Text } from "@chakra-ui/react";
import { useCommitment, useDoBattle } from "../src/hooks/useBattle";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";
import AppLink from "../src/components/AppLink";
import { OnResultFunction, QrReader } from "react-qr-reader";
import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { defaultAbiCoder, solidityKeccak256 } from "ethers/lib/utils";

export default function Scanner() {
  const [loading,setLoading] = useState(false)

  const { data: commitment, isFetching } = useCommitment();
  const isClient = useIsClientSide();
  const router = useRouter()
  const doBattle = useDoBattle();

  // This is a little weird, but onResult fires continuously after a scan
  // and so we need to make sure we're only handling it *once* after it's valid.
  const onResult: OnResultFunction = useCallback((() => {
    let locked = false

    return async (result) => {
      if (!result || locked) {
        return
      }
      locked = true // TODO: do we need to *unlock* this?
      setLoading(true)
      console.log("received result, shipping")
      const data = result.getText()

      console.log("got a battle");
      try {
        console.log('qr scan:', data)
        const [address, salt, tokenId] = defaultAbiCoder.decode(
          ["address", "bytes32", "uint256"],
          data
        );
        console.log('would be a commit of: ', solidityKeccak256(['bytes32', 'uint256'], [salt, tokenId]))
        const receipt = await doBattle.mutateAsync({
          opponentAddr: address,
          opponentSalt: salt,
          opponentTokenid: tokenId,
        });
        console.log('battle receipt: ', receipt)
        await router.push(`/battleComplete/${receipt.transactionHash}`)
      } finally {
        setLoading(false);
      }
    }

  })(), [router]);

  if (!isClient || isFetching || loading) {
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
