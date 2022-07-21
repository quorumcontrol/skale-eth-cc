import { BigNumber, constants, Signer, providers } from "ethers"
import { useEffect, useMemo } from "react"
import { useAccount, useProvider, useSigner } from "wagmi"
import { Battle__factory, GameItems__factory } from "../../contracts/typechain-types"
import { memoize } from "../utils/memoize"
import { addresses } from "../utils/networkSelector"
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { randomBytes } from "crypto"
import { Bytes, BytesLike, defaultAbiCoder, solidityKeccak256 } from "ethers/lib/utils"
import {  TypedListener } from "../../contracts/typechain-types/common"
import { BattleCompletedEvent, SaltUsedEvent } from "../../contracts/typechain-types/contracts/Battle"
import useWebsocketProvider from "./useWebsocketProvider"
import { useAllItems } from "./useGameItems"
import { TierUnlockedEvent, TransferSingleEvent } from "../../contracts/typechain-types/contracts/GameItems"
import addressExists from "../utils/addressExists"

const LOCAL_STORAGE_SALT_KEY = 'bps:salt'
const LOCAL_STORAGE_TOKEN_KEY = 'bps:tokenId'

const battleInterface = Battle__factory.createInterface()
const battleCompletedTopic = battleInterface.getEventTopic('BattleCompleted')

const gameItemsInterface = GameItems__factory.createInterface()
const transferSingleTopic = gameItemsInterface.getEventTopic('TransferSingle')
const tierUnlockedTopic = gameItemsInterface.getEventTopic('TierUnlocked')

const battleContract = memoize((signer:Signer, _address:string) => {
  const addr = addresses().Battle
  return Battle__factory.connect(addr, signer)
})

export const useBattleContract = () => {
  const { data:signer } = useSigner()

  return useMemo(() => {
    if (!signer) {
      return undefined
    }
    console.log('signer change: ', signer)
    return battleContract(signer, (signer as any).address)
  }, [signer])
}

const findBattleCompleted = (receipt:providers.TransactionReceipt) => {
  const evt = receipt.logs.find((log) => {
    return log.topics[0] === battleCompletedTopic
  })
  if (!evt) {
    throw new Error('bad transaction hash: missing battle completed topic')
  }
  const parsedEvt = battleInterface.parseLog(evt)
  console.log('parsed event: ', parsedEvt)
  return parsedEvt as unknown as  BattleCompletedEvent
}

const findMintedTokenEvents = (receipt:providers.TransactionReceipt) => {
  console.log('evts: ', receipt.logs)
  const evts = receipt.logs.filter((log) => {
    return log.topics[0] === transferSingleTopic
  })
  const parsedEvts = evts.map((evt) => gameItemsInterface.parseLog(evt))
  console.log('parsed minted: ', parsedEvts)
  return parsedEvts as unknown as  TransferSingleEvent[]
}

const maybeFindTierUnlockEvent = (receipt:providers.TransactionReceipt) => {
  const evt = receipt.logs.find((log) => {
    return log.topics[0] === tierUnlockedTopic
  })
  if (!evt) {
    return null
  }
  const parsedEvt = gameItemsInterface.parseLog(evt)
  console.log('parsed unlock: ', parsedEvt)
  return parsedEvt as unknown as TierUnlockedEvent
}

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

      const completedEvent = findBattleCompleted(receipt)
      const mintedTokenEvents = findMintedTokenEvents(receipt)
      const tierUnlockedEvent = maybeFindTierUnlockEvent(receipt)

      const mintedTokens = mintedTokenEvents.map((evt) => {
        return allItems[evt.args.id.toNumber()]
      })
      const isPlayerOne = completedEvent.args.playerOne.toLowerCase() === address.toLowerCase()
      const args = completedEvent.args

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
        mintedTokens,
        tierUnlocked: tierUnlockedEvent,
      }
    },
    {
      enabled: !!txHash && addressExists(address) && !!allItems
    }
  )
}

export const useSaltTransactionFinder = (salt?:BytesLike) => {
  const battleContract = useBattleContract()

  return useQuery(
    ['battle-transaction-finder', salt],
    async () => {
      if (!battleContract || !salt) {
        console.log('missing requirements', battleContract, salt)
        return
      }
      const filterOne = battleContract?.filters.SaltUsed(null, salt)
      const filterTwo = battleContract?.filters.SaltUsed(salt, null)
      const evts = await battleContract.queryFilter(filterOne)
      if (evts.length > 0) {
        return evts[0].transactionHash
      }

      const evts2 = await battleContract.queryFilter(filterTwo)
      if (evts2.length > 0) {
        return evts2[0].transactionHash
      }

      return null
    }, {
      refetchInterval: 2000,
      enabled: !!battleContract && !!salt,
    }
  )
}

export interface BattleInfo {
  opponentAddr:string
  opponentSalt:BytesLike
  opponentTokenid:BigNumber
}

export const useOnBattleComplete = (salt:BytesLike|undefined, onBattleComplete:TypedListener<SaltUsedEvent>) => {
  const battle = useBattleContract()

  useEffect(() => {
    if (!battle || !salt) {
      return
    }

    const handler:TypedListener<SaltUsedEvent> = (...args) => {
      onBattleComplete(...args)
    }

    // const wssBattle = battle.connect(websocketProvider)
    const wssBattle = battle // TODO: testing to see if using a non-websocket helps this.

    console.log('subscribing to saltUsed: ', salt)
    const p1Filter = wssBattle.filters.SaltUsed(null, salt)
    const p2Filter = wssBattle.filters.SaltUsed(salt, null)

    wssBattle.on(p1Filter, handler)
    wssBattle.on(p2Filter, handler)
    return () => {
      console.log('unsubscribing from salt used')
      wssBattle.off(p1Filter, handler)
      wssBattle.off(p2Filter, handler)
    }
  }, [battle, onBattleComplete, salt])
}

export const useDoBattle = () => {
  const { address } = useAccount()
  const { data:commitment } = useCommitment()
  const battleContract = useBattleContract()
  const queryClient = useQueryClient()

  const commitmentKey = ['commitment', address]

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
    queryClient.cancelQueries(commitmentKey)
    queryClient.setQueryData(commitmentKey, {
      isCommitted: false,
      salt: undefined,
      tokenId: undefined,
    })
    return receipt
  })
}

export const useEncodedCommitmentData = (_transactionHash:string, tokenId:number, salt:BytesLike) => {
  const { address } = useAccount()

  return useMemo(() => {
    const encoded = defaultAbiCoder.encode(
      ['address', 'bytes32', 'uint256'],
      [address, salt, BigNumber.from(tokenId)])
    console.log('encoded', encoded, address, salt, tokenId)
    return encoded
  }, [tokenId, salt, address])
}

export interface CommitmentData {
  isCommitted: boolean
  salt?: BytesLike
  tokenId? : number
}

export const useCommitment = () => {
  const { address, isConnected } = useAccount()
  const battleContract = useBattleContract()

  return useQuery(['commitment', address], async () => {
    if (!battleContract || !address) {
      throw new Error('something weird happened, missing things required by enable')
    }
    console.log('address in get commitment: ', address)
    const commitment = await battleContract.getCommitment(address)
    console.log("commitment fetched: ", commitment)
    const isCommitted = (commitment !== constants.HashZero)
    const storedSalt = localStorage.getItem(LOCAL_STORAGE_SALT_KEY)
    const storedTokenId = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
    return {
      isCommitted,
      salt: storedSalt ? `0x${storedSalt}` : undefined,
      tokenId: storedTokenId ? parseInt(storedTokenId, 10) : undefined,
    } as CommitmentData
  }, {
    enabled: isConnected && addressExists(address) && !!battleContract
  })
}

export const useDoCommit = () => {
  const { address } = useAccount()
  const battleContract = useBattleContract()
  const client = useQueryClient()

  const commitmentKey = ['commitment', address]

  return useMutation(async (tokenId:number) => {
    if (!battleContract) {
      throw new Error('missing battle contract')
    }

    console.log('battleContract: ', battleContract.signer, address)

    const salt = randomBytes(32)
    const commit = solidityKeccak256(['bytes32', 'uint256'], [salt, BigNumber.from(tokenId)])
    console.log('committing: ', commit, salt, tokenId)
    const transaction = await battleContract.commitItem(commit)
    transaction.wait().then((receipt) => {
      console.log("tx complete: ", receipt)
      localStorage.setItem(LOCAL_STORAGE_SALT_KEY, salt.toString('hex'))
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, tokenId.toString(10))
    })

    client.cancelQueries(commitmentKey)
    client.setQueriesData(commitmentKey, {
      isCommitted: true,
      salt: `0x${salt.toString('hex')}`,
      tokenId,
    })
    return {
      transactionHash: transaction.hash,
      salt: `0x${salt.toString('hex')}`,
      tokenId,
    }
  })
}
