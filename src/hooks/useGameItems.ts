import { BigNumber, providers } from "ethers"
import { useMemo } from "react"
import { useAccount, useProvider, useQuery } from "wagmi"
import { GameItems, GameItems__factory } from "../../contracts/typechain-types"
import { memoize } from "../utils/memoize"
import { addresses } from "../utils/networkSelector"
import ThenArg from "../utils/ThenArg"

const gameItemsContract = memoize((provider:providers.Provider) => {
  const addr = addresses().GameItems
  return GameItems__factory.connect(addr, provider)
})

export const useGameItemsContract = () => {
  const provider = useProvider()

  return useMemo(() => {
    return gameItemsContract(provider)
  }, [provider])
}

export interface InventoryItem {
  tokenId: number
  balance: BigNumber
  metadata: ThenArg<ReturnType<GameItems['getOnChainToken']>>
}

export const useInventory = () => {
  const gameItems = useGameItemsContract()
  const { address } = useAccount()

  // TODO: we probably want the contract to just handle what tokens the user has.
  return useQuery(['inventory', address], async () => {
    if (!address) {
      throw new Error('no address')
    }
    const balances = await Promise.all(Array(12).fill(true).map(async (_, tokenId):Promise<InventoryItem|undefined> => {
      const balance = await gameItems.balanceOf(address, tokenId)
      if (balance.gt(0)) {
        const metadata = await gameItems.getOnChainToken(tokenId)
        return {
          tokenId,
          metadata,
          balance
        }
      }
    }))

    return balances.filter((b) => !!b) as InventoryItem[]
  }, {
    enabled: !!address
  })
}

