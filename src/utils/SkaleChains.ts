import { Chain } from "@rainbow-me/rainbowkit";
import skaleLogo from '../assets/SKALE_logo.svg'

export const skaleTestnet: Chain = {
  id: 132333505628089,
  name: 'Skale Testnet',
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
  },
  blockExplorers: {
    default: { name: 'BlockScout', url: 'https://localhost:3000' },
  },
  testnet: true,
}
