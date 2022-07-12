import localAddresses from '../../contracts/deployments/localhost/addresses.json'
import { localhost, skaleTestnet } from './SkaleChains'

export enum chainEnvs {
  local = 'local',
  test = 'testnet',
  prod = 'mainnet',
}

export const activeChain = process.env.NEXT_PUBLIC_CHAIN || chainEnvs.local

export function addresses() {
  switch (activeChain) {
    case chainEnvs.local:
      return localAddresses
    default:
      throw new Error("UI doesn't yet support that chain")
  }
}

export function defaultNetwork() {
  switch (activeChain) {
    case chainEnvs.local:
      return localhost
    case chainEnvs.test:
      return skaleTestnet
    default:
      throw new Error('unsupported chain env')
  }
}
