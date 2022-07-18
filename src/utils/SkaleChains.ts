import { Chain } from "@rainbow-me/rainbowkit";
import skaleLogo from '../assets/SKALE_logo.svg'

export const skaleTestnet: Chain = {
  id: 132333505628089,
  name: 'SKALE Testnet',
  network: 'skaletestnet',
  iconUrl: skaleLogo.path,
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'sFUEL',
    symbol: 'sFUEL',
  },
  rpcUrls: {
    default: 'https://testnet-proxy.skalenodes.com/v1/whispering-turais',
    wss: 'wss://testnet-proxy.skalenodes.com/v1/ws/whispering-turais',
  },
  blockExplorers: {
    default: { name: 'BlockScout', url: 'https://whispering-turais.testnet-explorer.skalenodes.com/' },
  },
  testnet: true,
};

export const calypsoHub: Chain = {
  id: 1564830818,
  name: 'Calypso Hub',
  network: 'calypso-hub',
  iconUrl: skaleLogo.path,
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'sFUEL',
    symbol: 'sFUEL',
  },
  rpcUrls: {
    default: 'https://mainnet.skalenodes.com/v1/honorable-steel-rasalhague',
    wss: 'wss://mainnet.skalenodes.com/v1/ws/honorable-steel-rasalhague',
  },
  blockExplorers: {
    default: { name: 'BlockScout', url: 'https://honorable-steel-rasalhague.explorer.mainnet.skalenodes.com/' },
  },
  testnet: false,
};

export const localhost: Chain = {
  id: 31337,
  name: 'Localhost',
  network: 'Hardhat',
  iconUrl: skaleLogo.path,
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'sFUEL',
    symbol: 'sFUEL',
  },
  rpcUrls: {
    default: 'http://127.0.0.1:8545/',
    wss: 'ws://127.0.0.1:8545/',
  },
  blockExplorers: {
    default: { name: 'BlockScout', url: 'https://localhost:3000' },
  },
  testnet: true,
}
