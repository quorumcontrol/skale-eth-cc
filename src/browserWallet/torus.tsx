
import { ethers } from "ethers";
import { defaultNetwork } from "../utils/networkSelector";
import Torus from "@toruslabs/torus-embed";
import { memoize } from "../utils/memoize";

const chain = defaultNetwork()

export const torus = new Torus();

export const getTorus = memoize(async () => {
  await torus.init({
    network: {
      networkName: '',
      chainId: chain.id,
      host: chain.rpcUrls.default,
      ticker: 'sFUEL',
      tickerName: 'sFUEL',
    },
    enableLogging: true,
    showTorusButton: false,
    useLocalStorage: true,
  });
  return torus 
})
