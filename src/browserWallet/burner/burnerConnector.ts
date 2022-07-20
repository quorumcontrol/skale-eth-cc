import { ethers, providers, Signer } from 'ethers'
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
import { getAuth } from './burnerAuth'

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

export class BurnerConnector extends InjectedConnector {
  readonly id = 'burner-wallet'
  readonly ready = true

  provider?: ethers.providers.ExternalProvider
  signer?: ethers.Signer

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
      
      const { provider, signer } = await getAuth()
      this.provider = provider as unknown as providers.ExternalProvider
      this.signer = signer

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

      return { account, chain: { id, unsupported }, provider: (provider as unknown as Ethereum) }
    } catch (error) {
      if (this.isUserRejectedRequestError(error))
        throw new UserRejectedRequestError(error)
      if ((<RpcError>error).code === -32002)
        throw new ResourceUnavailableError(error)
      throw error
    }
  }

  async getSigner(): Promise<ethers.providers.JsonRpcSigner> {
    if (!this.provider || !this.signer) {
      throw new Error('no signer')
    }
    // const signer = new ethers.providers.Web3Provider(this.provider).getSigner()
    console.log('get signer', this.signer, await this.signer.getAddress())

    return this.signer as unknown as providers.JsonRpcSigner
  }

  async getAccount(): Promise<string> {
    if (!this.signer) {
      throw new Error('no signer')
    }
    const address = await this.signer.getAddress()
    console.log('get ccount: ', address)
    return address
  }

  async getProvider() {
   return this.provider as Ethereum
  }
}
