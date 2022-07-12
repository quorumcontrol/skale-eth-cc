import { ethers, providers, Wallet } from "ethers"
import { Eip1193Bridge } from "@ethersproject/experimental";
import { defaultNetwork } from "./networkSelector";

function getStoredKey() {
  const hexKey = localStorage.getItem('bps:browserPK')
  if (hexKey) {
    return hexKey
  }
  const newKey = Wallet.createRandom()
  const pk = newKey.privateKey
  localStorage.setItem('bps:browserPK', pk)
  return pk
}

export function setupMobileBrowserWallet() {
  if (typeof window === 'undefined' || window.ethereum) {
    return
  }
  const chain = defaultNetwork()
  const provider = chain.rpcUrls.wss ? new providers.WebSocketProvider(chain.rpcUrls.wss) : new providers.JsonRpcProvider(chain.rpcUrls.default)

  const wallet = new Wallet(getStoredKey()).connect(provider)

  const bridge:any = new Eip1193Bridge(wallet, provider)
  console.log('bridge: ', bridge)
  bridge.isMetamask = false
  window.ethereum = bridge
}