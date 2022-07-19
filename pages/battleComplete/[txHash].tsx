import { Box, Heading, Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import AppLink from "../../src/components/AppLink";
import NFTCard from "../../src/components/NFTCard";
import { useBattleTransaction } from "../../src/hooks/useBattle";
import { InventoryItem } from "../../src/hooks/useGameItems";
import useIsClientSide from "../../src/hooks/useIsClientSide";
import Layout from "../../src/layouts/Layout";
import { verbs, playoffVerbForTx } from "../../src/utils/verbs";

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

const Verb:React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Box as="span" textTransform="uppercase">{children}</Box>
}

const BattleComplete: React.FC = () => {
  const router = useRouter();
  const { txHash } = router.query;
  const { data } = useBattleTransaction(txHash as string | undefined);
  const isClient = useIsClientSide();
  const verb = data && (verbs[data.winningItem.id] || {})[data.losingItem.id]

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
      <Box width="100%"><AppLink href="/inventory">&lt; Play again</AppLink></Box>
      {data.playerIsWinner && <Heading>You win!</Heading>}
      {data.tierUnlocked && <Heading>Tier Unlocked!</Heading>}
      {data.draw && <Heading>Draw! Battle again one day.</Heading>}
      {!data.draw && !data.playerIsWinner && <Heading>You lose.</Heading>}
      {!data.draw && verb && (
        <Text>
          {data.winningItem.metadata.name} <Verb>{verb}</Verb> {data.losingItem.metadata.name}
        </Text>
      )}
      {!data.draw && !verb && (
        <Text>
          {data.winningItem.metadata.name} beat {data.losingItem.metadata.name} in a <Verb>{playoffVerbForTx(txHash as string)}</Verb>
        </Text>
      )}
      {data.playerIsWinner && <CollectedItems items={data.mintedTokens} />}
    </Layout>
  );
};

export default BattleComplete;
