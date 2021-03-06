import { calypsoHub, localhost, skaleTestnet } from './SkaleChains'

export enum chainEnvs {
  local = 'local',
  test = 'testnet',
  prod = 'mainnet',
}

export const activeChain = process.env.NEXT_PUBLIC_CHAIN || chainEnvs.local

export function addresses() {
  switch (activeChain) {
    case chainEnvs.local:
      try {
        return require('../../contracts/deployments/localhost/addresses.json')
      } catch (err) {
        console.error('no local addresses')
        return {}
      }
    case chainEnvs.test:
      return require('../../contracts/deployments/skaletest/addresses.json')
    case chainEnvs.prod:
      return require('../../contracts/deployments/calypso/addresses.json')
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
    case chainEnvs.prod:
      return calypsoHub
    default:
      throw new Error('unsupported chain env')
  }
}
