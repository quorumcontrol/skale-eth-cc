import { Button, Heading, Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import NextLink from "next/link";
import NFTCard from "../src/components/NFTCard";
import { useCommitment, useDoCommit } from "../src/hooks/useBattle";
import { useInventory } from "../src/hooks/useGameItems";
import useIsClientSide from "../src/hooks/useIsClientSide";
import Layout from "../src/layouts/Layout";

export default function Inventory() {
  const [loading, setLoading] = useState(false);
  const { data: tokens, isFetching } = useInventory();
  const isClient = useIsClientSide();
  const {
    data: commitment,
    isFetching: commitmentFetching,
    isIdle,
  } = useCommitment();
  const commit = useDoCommit();
  const router = useRouter();

  const onChoose = async (tokenId: number) => {
    setLoading(true);
    try {
      const receipt = await commit.mutateAsync(tokenId);
      console.log("commit receipt: ", receipt);
      await router.push("/battle");
    } finally {
      setLoading(false);
    }
  };

  const allowItemChoice =
    !isIdle && !commitmentFetching && commitment && !commitment.isCommitted;

  if (isIdle || !isClient || loading || isFetching || commitmentFetching) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading>Inventory</Heading>
      <Text>Choose the item to play against your opponent.</Text>
      {!isIdle && !commitmentFetching && commitment && commitment.isCommitted && (
        <>
          <Text>You already have an item chosen.</Text>
          <NextLink href="/battle">
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
