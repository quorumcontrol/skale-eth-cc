import { Heading, Spinner, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useBattleTransaction } from '../../src/hooks/useBattle'
import useIsClientSide from '../../src/hooks/useIsClientSide'
import Layout from "../../src/layouts/Layout"

const BattleComplete:React.FC = () => {
  const router = useRouter()
  const { txHash } = router.query
  const { data } = useBattleTransaction(txHash as string|undefined)
  const isClient = useIsClientSide()

  if (!isClient || !data) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    )
  }

  console.log('results: ', data)
  return (
    <Layout>
      {data.playerIsWinner && <Heading>You win!</Heading>}
      {data.draw && <Heading>Draw! Battle again one day.</Heading>}
      {!data.draw && !data.playerIsWinner && <Heading>You lose.</Heading>}
      {!data.draw && (
        // TODO: here is where we would substitute "beats" with the verbs from the chart.
        <Text>{data.winningItem.metadata.name} beats {data.losingItem.metadata.name}</Text>
      )}
      {data.playerIsWinner && (
        <Text>That means you&apos;ve collected a nice {data.losingItem.metadata.name}</Text>
      )}
    </Layout>
  )
}

export default BattleComplete
