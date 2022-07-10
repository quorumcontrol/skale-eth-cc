
export enum chainEnvs {
  local = 'local',
  test = 'testnet',
  prod = 'mainnet',
}

export const activeChain = process.env.NEXT_PUBLIC_CHAIN || chainEnvs.local
