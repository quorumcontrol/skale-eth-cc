import { BigNumber, constants, Signer } from "ethers"
import { useMemo } from "react"
import { useAccount, useSigner } from "wagmi"
import { Battle__factory } from "../../contracts/typechain-types"
import { memoize } from "../utils/memoize"
import { addresses } from "../utils/networkSelector"
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { randomBytes } from "crypto"
import { BytesLike, defaultAbiCoder, solidityKeccak256 } from "ethers/lib/utils"

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

export interface BattleInfo {
  opponentAddr:string
  opponentSalt:BytesLike
  opponentTokenid:BigNumber
}

export const useDoBattle = () => {
  const { data:commitment } = useCommitment()
  const battleContract = useBattleContract()

  return useMutation(async (info:BattleInfo) => {
    if (!commitment || !commitment.isCommitted || !battleContract) {
      throw new Error('pre-reqs not ready')
    }
    const tx = await battleContract.battle(info.opponentAddr, info.opponentSalt, info.opponentTokenid, commitment.salt!, commitment.tokenId!)
    console.log('battle tx: ', tx.hash)
    return tx.wait()
  })
}

export const useEncodedCommitmentData = () => {
  const { address } = useAccount()
  const { data:commitment } = useCommitment()

  return useMemo(() => {
    if (!address || !commitment || !commitment.isCommitted) {
      return undefined
    }
    return defaultAbiCoder.encode(
      ['address', 'bytes32', 'uint256'],
      [address, commitment.salt, commitment.tokenId])
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
