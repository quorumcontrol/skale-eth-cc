import { providers, utils } from "ethers"
import { useEffect, useMemo } from "react"
import { useAccount, useProvider, useSigner } from "wagmi"
import { useMutation, useQuery } from 'react-query'
import { GameItems__factory } from "../../contracts/typechain-types"
import { memoize } from "../utils/memoize"
import { addresses } from "../utils/networkSelector"
import addressExists from "../utils/addressExists"

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

export const useDoSignup = () => {
  return useMutation(async ({address }: {address: string}) => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return fetch('/api/signup', {
      method: 'POST',
      body: Buffer.from(JSON.stringify({
        address
      })),
    })
  })
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
    // gas ranges due to a loop, so giving a bunch of gas manually here
    // see https://whispering-turais.testnet-explorer.skalenodes.com/tx/0x9a89e86e271f02531b279559b966a76cd1124c634924b3934023e0b701032f73/token-transfers
    // for a working Tx
    const tx = await gameItems.connect(signer).initialMint(address, { gasLimit: 300000, value: utils.parseEther('0.5')})
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
    enabled: addressExists(address)
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
      } as InventoryItem
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
    enabled: addressExists(address)
  })
}

