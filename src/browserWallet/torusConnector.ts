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
  name?: string | ((detectedName: string | string[]) => string)
  shimChainChangedDisconnect?: boolean
  shimDisconnect?: boolean
}

export type MetaMaskConnectorOptions = Pick<
  InjectedConnectorOptions,
  'shimChainChangedDisconnect' | 'shimDisconnect'
> & {
  UNSTABLE_shimOnConnectSelectAccount?: boolean
}

export class TorusConnector extends InjectedConnector {
  readonly id = 'torus'
  readonly ready = true

  provider?: ethers.providers.ExternalProvider

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

      const account = await this.getAccount()
      // Switch to chain if provided
      let id = await this.getChainId()
      let unsupported = this.isChainUnsupported(id)
      if (chainId && id !== chainId) {
        const chain = await this.switchChain(chainId)
        id = chain.id
        unsupported = this.isChainUnsupported(id)
      }

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
   return this.provider as any
  }
}
