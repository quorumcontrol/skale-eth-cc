import { defaultNetwork } from "../../utils/networkSelector";
import { providers, Wallet } from "ethers";
import { memoize } from "../../utils/memoize";
import { Eip1193Bridge } from '../../utils/eip1193-bridge'

const chain = defaultNetwork()

const pkKey = 'sps-privateKey'

const getPrivateKey = memoize(() => {
  let pk = localStorage.getItem(pkKey)
  if (!pk) {
    pk = Wallet.createRandom().privateKey
    localStorage.setItem(pkKey, pk)
  }
  return pk
})

export const getAuth = memoize(async () => {
  const provider = new providers.StaticJsonRpcProvider(chain.rpcUrls.default)

  const signer = new Wallet(getPrivateKey()).connect(provider)
  await signer.getAddress()
  const bridge = new Eip1193Bridge(signer, provider)

  return {
    provider: bridge,
    signer: signer,
    ethersProvider: provider,
  }
})
