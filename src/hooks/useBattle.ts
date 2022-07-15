import { BigNumber, constants, Signer } from "ethers"
import { useEffect, useMemo } from "react"
import { useAccount, useProvider, useSigner } from "wagmi"
import { Battle__factory } from "../../contracts/typechain-types"
import { memoize } from "../utils/memoize"
import { addresses } from "../utils/networkSelector"
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { randomBytes } from "crypto"
import { BytesLike, defaultAbiCoder, solidityKeccak256 } from "ethers/lib/utils"
import { TypedListener } from "../../contracts/typechain-types/common"
import { BattleCompletedEvent } from "../../contracts/typechain-types/contracts/Battle"
import useWebsocketProvider from "./useWebsocketProvider"
import { useAllItems } from "./useGameItems"

const LOCAL_STORAGE_SALT_KEY = 'bps:salt'
const LOCAL_STORAGE_TOKEN_KEY = 'bps:tokenId'

const battleContract = memoize((signer:Signer) => {
  const addr = addresses().Battle
  return Battle__factory.connect(addr, signer)
})

export const useBattleContract = () => {
  const { data:signer } = useSigner()

  return useMemo(() => {
    if (!signer) {
      return undefined
    }
    return battleContract(signer)
  }, [signer])
}

// event BattleCompleted(
//   address indexed playerOne,
//   address indexed playerTwo,
//   uint8 result,
//   uint256 playerOneItem,
//   uint256 playerTwoItem
// );

export const useBattleTransaction = (txHash?:string) => {
  const provider = useProvider()
  const { address } = useAccount()
  const { data:allItems } = useAllItems()

  return useQuery(
    ['use-battle-transaction', txHash],
    async () => {
      if (!address || !allItems) {
        throw new Error('weirdly no address or allItems')
      }
      console.log('fetching receipt for ', txHash)
      const receipt = await provider.getTransactionReceipt(txHash!)
      console.log('receipt: ', receipt)

      const battleInterface = Battle__factory.createInterface()
      const evt = receipt.logs.find((log) => {
        return log.topics[0] === battleInterface.getEventTopic('BattleCompleted')
      })
      if (!evt) {
        throw new Error('bad transaction hash: missing topic')
      }
      const parsedEvt = battleInterface.parseLog(evt)
      console.log('parsed event: ', parsedEvt)

      const isPlayerOne = parsedEvt.args.playerOne.toLowerCase() === address.toLowerCase()
      const args = parsedEvt.args

      const myItemId = isPlayerOne ? args.playerOneItem : args.playerTwoItem
      const opponentItemId = isPlayerOne ? args.playerTwoItem : args.playerOneItem
      const result = args.result
      const playerIsWinner = (result === 0 && isPlayerOne) || (result === 1 && !isPlayerOne)
      const myItem = allItems[myItemId.toNumber()]
      const opponentItem =  allItems[opponentItemId.toNumber()]

      return {
        result,  // 0 = p1 wins, 1 = p2 wins, 2 = draw
        playerIsWinner,
        draw: result === 2,
        myItem,
        opponentItem,
        winningItem: playerIsWinner ? myItem : opponentItem,
        losingItem: playerIsWinner ? opponentItem : myItem,
      }
    },
    {
      enabled: !!txHash && !!address && !!allItems
    }
  )
}

export interface BattleInfo {
  opponentAddr:string
  opponentSalt:BytesLike
  opponentTokenid:BigNumber
}

export const useOnBattleComplete = (onBattleComplete:TypedListener<BattleCompletedEvent>) => {
  const battle = useBattleContract()
  const websocketProvider = useWebsocketProvider()
  const { address } = useAccount()

  useEffect(() => {
    if (!battle || !address) {
      return
    }
    const wssBattle = battle.connect(websocketProvider)

    console.log('subscribing to battleCompleted: ', address)
    const p1Filter = wssBattle.filters.BattleCompleted(address, null, null, null, null)
    const p2Filter = wssBattle.filters.BattleCompleted(null, address, null, null, null)

    wssBattle.on(p1Filter, onBattleComplete)
    wssBattle.on(p2Filter, onBattleComplete)
    return () => {
      console.log('unsubscribing from battle completed')
      wssBattle.off(p1Filter, onBattleComplete)
      wssBattle.off(p2Filter, onBattleComplete)
    }
  }, [battle, address])
}

export const useDoBattle = () => {
  const { data:commitment } = useCommitment()
  const battleContract = useBattleContract()

  return useMutation(async (info:BattleInfo) => {
    if (!commitment || !commitment.isCommitted || !battleContract) {
      throw new Error('pre-reqs not ready')
    }
    console.log("doing battle: ", info)
    const opponentCommitment = await battleContract.getCommitment(info.opponentAddr)
    console.log("opponent commitment: ", opponentCommitment)
    const tx = await battleContract.battle(info.opponentAddr, info.opponentSalt, info.opponentTokenid, commitment.salt!, commitment.tokenId!)
    console.log('battle tx: ', tx.hash)
    const receipt = await tx.wait()
    return receipt
  })
}

export const useEncodedCommitmentData = () => {
  const { address } = useAccount()
  const { data:commitment } = useCommitment()

  return useMemo(() => {
    if (!address || !commitment || !commitment.isCommitted) {
      return undefined
    }
    const encoded = defaultAbiCoder.encode(
      ['address', 'bytes32', 'uint256'],
      [address, commitment.salt, BigNumber.from(commitment.tokenId)])
    console.log('encoded', encoded, address, commitment.salt, commitment.tokenId)
    return encoded
  }, [commitment, address])
}

export const useCommitment = () => {
  const { address } = useAccount()
  const battleContract = useBattleContract()

  return useQuery(['commitment', address], async () => {
    if (!battleContract || !address) {
      throw new Error('something weird happened, missing things required by enable')
    }
    const isCommitted = (await battleContract.getCommitment(address)) !== constants.HashZero
    const storedSalt = localStorage.getItem(LOCAL_STORAGE_SALT_KEY)
    const storedTokenId = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
    return {
      isCommitted,
      salt: storedSalt ? Buffer.from(storedSalt, 'hex') : undefined,
      tokenId: storedTokenId ? parseInt(storedTokenId, 10) : undefined
    }
  }, {
    enabled: !!address && !!battleContract
  })
}

export const useDoCommit = () => {
  const { address } = useAccount()
  const battleContract = useBattleContract()
  const client = useQueryClient()

  return useMutation(async (tokenId:number) => {
    if (!battleContract) {
      throw new Error('missing battle contract')
    }

    const salt = randomBytes(32)
    localStorage.setItem(LOCAL_STORAGE_SALT_KEY, salt.toString('hex'))
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, tokenId.toString(10))
    const commit = solidityKeccak256(['bytes32', 'uint256'], [salt, BigNumber.from(tokenId)])
    console.log('committing: ', commit, salt, tokenId)
    const tx = await battleContract.commitItem(commit)
    return tx.wait()
  }, {
    onSuccess: () => {
      client.invalidateQueries([['commitment', address]], {
        refetchInactive: true,
      })
    }
  })
}
