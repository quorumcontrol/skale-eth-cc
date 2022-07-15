import { BigNumber, providers, utils } from "ethers"
import { useEffect, useMemo } from "react"
import { useAccount, useProvider, useSigner } from "wagmi"
import { useMutation, useQuery } from 'react-query'
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

export const useOnSignedUp = (onSignedUp:()=>any) => {
  const { address } = useAccount()
  const gameItems = useGameItemsContract()

  useEffect(() => {
    if (!address) {
      return
    }
    const filter = gameItems.filters.NewPlayer(address, null)
    gameItems.on(filter, onSignedUp)
    return () => {
      gameItems.off(filter, onSignedUp)
    }
  }, [address, gameItems, onSignedUp])
}

export interface Metadata {
  name:string
  image:string
  animationUrl:string
  description: string
}

export interface InventoryItem {
  id: number,
  metadata: Metadata
}

export const useDoOnboard = () => {
  const { data:signer } = useSigner()
  const gameItems = useGameItemsContract()

  return useMutation(async (address:string) => {
    if (!signer) {
      throw new Error('no signer')
    }
    const tx = await gameItems.connect(signer).initialMint(address, { value: utils.parseEther('0.5')})
    console.log('onboard tx: ', tx.hash)
    const receipt = await tx.wait()
    console.log('receipt')
    return receipt
  })
}

export const useCanOnboard = () => {
  const gameItems = useGameItemsContract()
  const { address } = useAccount()

  return useQuery(['can-onboard', address],
  async () => {
    const minterRole = await gameItems.MINTER_ROLE()
    const hasRole = await gameItems.hasRole(minterRole, address!)

    console.log("has role? ", hasRole)

    return hasRole
  },
  {
    enabled: !!address
  })
}

export const useAllItems = () => {
  const gameItems = useGameItemsContract()
  return useQuery(['all-items'], async () => {
    const numItems = await gameItems.getNumberItems()
    return Promise.all(Array(numItems.toNumber()).fill(true).map(async (_, i) => {
      const item = await gameItems.getOnChainToken(i)
      return {
        id: i,
        metadata: {
          name: item.name,
          image: item.image,
          animationUrl: item.animationUrl,
          description: item.description,
        },
      }
    }))
  })
}

export const useInventory = () => {
  const gameItems = useGameItemsContract()
  const { address } = useAccount()

  // TODO: we probably want the contract to just handle what tokens the user has.
  return useQuery(['inventory', address], async () => {
    if (!address) {
      throw new Error('no address')
    }

    const items:InventoryItem[] = (await gameItems.getItems(address)).map((item, i) => {
      return {
        id: i,
        metadata: {
          name: item.name,
          image: item.image,
          animationUrl: item.animationUrl,
          description: item.description,
        },
      }
    })
    return items.filter((item) => item.metadata.name !== '')
  }, {
    enabled: !!address
  })
}

