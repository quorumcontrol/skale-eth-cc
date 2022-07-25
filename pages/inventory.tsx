import { Button, Heading, Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import NextLink from "next/link";
import NFTCard from "../src/components/NFTCard";
import { useCommitment, useDoCommit } from "../src/hooks/useBattle";
import { useInventory } from "../src/hooks/useGameItems";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";
import { useAccount, useWaitForTransaction } from "wagmi";
import { useQueryClient } from "react-query";

export default function Inventory() {
  const [loading, setLoading] = useState(false);
  const { data: tokens, isFetching } = useInventory();
  const isClient = useIsClientSide();
  const {
    data: commitment,
    isFetching: commitmentFetching,
  } = useCommitment();
  const commit = useDoCommit();
  const router = useRouter();
  const client = useQueryClient()
  const { address } = useAccount()

  const { transactionHash } = router.query
  const { data:transactionData } = useWaitForTransaction({ hash: transactionHash as string, onSuccess: () => {
    client.cancelQueries(['inventory', address])
    client.invalidateQueries(['inventory', address], {
      refetchInactive: true,
    })
  }})

  const onChoose = async (tokenId: number) => {
    setLoading(true);
    try {
      const { salt, transactionHash } = await commit.mutateAsync(tokenId);
      await router.push(`/battle/${transactionHash}/${salt}/${tokenId}`);
    } finally {
      setLoading(false);
    }
  };

  const allowItemChoice =
    !commitmentFetching && commitment && !commitment.isCommitted;

  if (!isClient || loading || isFetching || commitmentFetching || (transactionHash && !transactionData)) {
    return (
      <Layout>
        <Text>Fetching your inventory.</Text>
        <Spinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading>Inventory</Heading>
      <Text>Choose the item to play against your opponent.</Text>
      {!commitmentFetching && commitment && commitment.isCommitted && (
        <>
          <Text>You already have an item chosen.</Text>
          <NextLink href={`/battle/${commitment.salt}`}>
            <Button>Battle</Button>
          </NextLink>
        </>
      )}
      {isClient && tokens && tokens.length == 0 && (
        <Text>
          Looks like you have no items, you&lsquo;ll need to get an invite code.
        </Text>
      )}
      {isClient &&
        tokens &&
        tokens.map((token) => {
          return (
            <NFTCard
              item={token}
              key={`inventory-card-${token.id}`}
              onChoose={allowItemChoice ? onChoose : undefined}
            />
          );
        })}
    </Layout>
  );
}
