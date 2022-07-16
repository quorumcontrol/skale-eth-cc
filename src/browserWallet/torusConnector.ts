import { ethers } from 'ethers'
import {
  Chain,
  ConnectorNotFoundError,
  ResourceUnavailableError,
  RpcError,
  UserRejectedRequestError,
} from 'wagmi'
import {
  InjectedConnector,
} from 'wagmi/connectors/injected'
import { getTorus, torus } from './torus'

type InjectedConnectorOptions = {
  /** Name of connector */
  name?: string | ((detectedName: string | string[]) => string)
  /**
   * MetaMask 10.9.3 emits disconnect event when chain is changed.
   * This flag prevents the `"disconnect"` event from being emitted upon switching chains.
   * @see https://github.com/MetaMask/metamask-extension/issues/13375#issuecomment-1027663334
   */
  shimChainChangedDisconnect?: boolean
  /**
   * MetaMask and other injected providers do not support programmatic disconnect.
   * This flag simulates the disconnect behavior by keeping track of connection status in storage.
   * @see https://github.com/MetaMask/metamask-extension/issues/10353
   * @default true
   */
  shimDisconnect?: boolean
}

export type MetaMaskConnectorOptions = Pick<
  InjectedConnectorOptions,
  'shimChainChangedDisconnect' | 'shimDisconnect'
> & {
  /**
   * While "disconnected" with `shimDisconnect`, allows user to select a different MetaMask account (than the currently connected account) when trying to connect.
   */
  UNSTABLE_shimOnConnectSelectAccount?: boolean
}

export class TorusConnector extends InjectedConnector {
  readonly id = 'torus'
  readonly ready = true

  provider?: ethers.providers.ExternalProvider
  // #UNSTABLE_shimOnConnectSelectAccount: MetaMaskConnectorOptions['UNSTABLE_shimOnConnectSelectAccount']

  constructor({
    chains,
    options: options_,
  }: {
    chains?: Chain[]
    options?: MetaMaskConnectorOptions
  } = {}) {
    const options = {
      name: 'Torus Wallet',
      shimDisconnect: true,
      shimChainChangedDisconnect: true,
      ...options_,
    }
    super({
      chains,
      options,
    })

    // this.#UNSTABLE_shimOnConnectSelectAccount =
    //   options.UNSTABLE_shimOnConnectSelectAccount
  }

  async connect({ chainId }: { chainId?: number } = {}) {
    try {      
      const provider = await this.getProvider()
      if (!provider) throw new ConnectorNotFoundError()
      await new Promise((resolve) => {
        const promise = torus.login()
        // this is super hacky, but the rainbow kit modal appears *in front of* the iframe without adjusting the zIndex
        // change. So, this is a hack, to make it appear more normal to the user.
        setTimeout(() => {
          document.getElementById('torusIframe')!.style.zIndex = '2147483647'
          console.log('z index: ', document.getElementById('torusIframe')!.style.zIndex)
        }, 100)
        resolve(promise)
      })

      if (provider.on) {
        provider.on('accountsChanged', this.onAccountsChanged)
        provider.on('chainChanged', this.onChainChanged)
        provider.on('disconnect', this.onDisconnect)
      }

      this.emit('message', { type: 'connecting' })

      // Attempt to show wallet select prompt with `wallet_requestPermissions` when
      // `shimDisconnect` is active and account is in disconnected state (flag in storage)
      // if (
      //   // this.#UNSTABLE_shimOnConnectSelectAccount &&
      //   this.options?.shimDisconnect &&
      //   // !getClient().storage?.getItem(shimDisconnectKey)
      // ) {
      //   const accounts = await provider
      //     .request({
      //       method: 'eth_accounts',
      //     })
      //     .catch(() => [])
      //   const isConnected = !!accounts[0]
      //   if (isConnected)
      //     await provider.request({
      //       method: 'wallet_requestPermissions',
      //       params: [{ eth_accounts: {} }],
      //     })
      // }

      const account = await this.getAccount()
      // Switch to chain if provided
      let id = await this.getChainId()
      let unsupported = this.isChainUnsupported(id)
      if (chainId && id !== chainId) {
        const chain = await this.switchChain(chainId)
        id = chain.id
        unsupported = this.isChainUnsupported(id)
      }

      // if (this.options?.shimDisconnect)
      //   getClient().storage?.setItem(shimDisconnectKey, true)

      return { account, chain: { id, unsupported }, provider }
    } catch (error) {
      if (this.isUserRejectedRequestError(error))
        throw new UserRejectedRequestError(error)
      if ((<RpcError>error).code === -32002)
        throw new ResourceUnavailableError(error)
      throw error
    }
  }

  async getProvider() {
   this.provider = (await getTorus()).provider
   return this.provider as Ethereum
  }

  // private getReady(ethereum?: Ethereum) {
  //   const isMetaMask = !!ethereum?.isMetaMask
  //   if (!isMetaMask) return
  //   // Brave tries to make itself look like MetaMask
  //   // Could also try RPC `web3_clientVersion` if following is unreliable
  //   if (ethereum.isBraveWallet && !ethereum._events && !ethereum._state) return
  //   if (ethereum.isTokenPocket) return
  //   if (ethereum.isTokenary) return
  //   return ethereum
  // }

  // private findProvider(ethereum?: Ethereum) {
  //   if (ethereum?.providers) return ethereum.providers.find(this.#getReady)
  //   return this.#getReady(ethereum)
  // }
}