import { BigNumber, constants, providers, Signer } from "ethers"
import { useMemo } from "react"
import { useAccount, useProvider, useSigner } from "wagmi"
import { Battle__factory, GameItems, GameItems__factory } from "../../contracts/typechain-types"
import { memoize } from "../utils/memoize"
import { addresses } from "../utils/networkSelector"
import { useQuery, useMutation } from 'react-query'
import { randomBytes } from "crypto"

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

export const useIsCommited = () => {
  const { address } = useAccount()
  const battleContract = useBattleContract()

  return useQuery(['is-commited', address], async () => {
    if (!battleContract || !address) {
      throw new Error('something weird happened, missing things required by enable')
    }
    return (await battleContract.getCommitment(address)) !== constants.HashZero
  }, {
    enabled: !!address && !!battleContract
  })
}

export const useCommitment = () => {
  const { address } = useAccount()
  const battleContract = useBattleContract()

  return useMutation(async () => {
    if (!battleContract) {
      throw new Error('missing battle contract')
    }

    const salt = randomBytes(32)

    const tx = await battleContract.commitItem()
  })
}
