import { Heading, Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import NFTCard from "../../src/components/NFTCard";
import { useBattleTransaction } from "../../src/hooks/useBattle";
import { InventoryItem } from "../../src/hooks/useGameItems";
import useIsClientSide from "../../src/hooks/useIsClientSide";
import Layout from "../../src/layouts/Layout";

const CollectedItems: React.FC<{ items: InventoryItem[] }> = ({ items }) => {
  if (items.length === 1) {
    return (
      <>
        <Text>
          That means you&apos;ve collected a nice {items[0].metadata.name}.
        </Text>
        <NFTCard item={items[0]} />
      </>
    );
  }

  return (
    <>
      <Text>You&apos;ve collected items!</Text>
      {items.map((item) => {
        return <NFTCard item={item} key={`battle-completed-${item.id}`} />;
      })}
    </>
  );
};

const BattleComplete: React.FC = () => {
  const router = useRouter();
  const { txHash } = router.query;
  const { data } = useBattleTransaction(txHash as string | undefined);
  const isClient = useIsClientSide();

  if (!isClient || !data) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  console.log("results: ", data);
  return (
    <Layout>
      {data.playerIsWinner && <Heading>You win!</Heading>}
      {data.draw && <Heading>Draw! Battle again one day.</Heading>}
      {!data.draw && !data.playerIsWinner && <Heading>You lose.</Heading>}
      {!data.draw && (
        // TODO: here is where we would substitute "beats" with the verbs from the chart.
        <Text>
          {data.winningItem.metadata.name} beats {data.losingItem.metadata.name}
        </Text>
      )}
      {data.playerIsWinner && <CollectedItems items={data.mintedTokens} />}
    </Layout>
  );
};

export default BattleComplete;
