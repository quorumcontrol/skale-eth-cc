import { providers } from "ethers"
import { useMemo } from "react"
import { memoize } from "../utils/memoize"
import { defaultNetwork } from "../utils/networkSelector"


const getWebsocketProvider = memoize((url:string) => {
  return new providers.WebSocketProvider(url)
})

 // TODO: wagmi supports something like this, but it's too hard to understand the docs
const useWebsocketProvider = () => {
  const chain = defaultNetwork()
  return useMemo(() => {
    if (!chain.rpcUrls.wss) {
      throw new Error('no wss url provided for chain')
    }
    return getWebsocketProvider(chain.rpcUrls.wss)
  }, [chain])
}

export default useWebsocketProvider