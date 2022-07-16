import { Wallet } from "@rainbow-me/rainbowkit";
import { defaultNetwork } from "../utils/networkSelector";
import { TorusConnector } from "./torusConnector";

const chain = defaultNetwork()


export const torusWallet = ({ chains }: any): Wallet => ({
  id: 'torus-wallet',
  name: 'Torus (No Install)',
  iconUrl: 'https://tor.us/images/torus-icon-blue-3.svg',
  iconBackground: '#0c2f78',
  downloadUrls: {
    android: 'https://app.tor.us/',
    ios: 'https://app.tor.us/',
    qrCode: 'https://app.tor.us/',
  },

  createConnector: () => {
    const connector = new TorusConnector({ chains })
    return {
      connector,
      installed: true,
      mobile: {
        getUri: async () => {
          // const { uri } = (await connector.getProvider()).connector;
          return chain.rpcUrls.default
        },
      },
      qrCode: {
        getUri: async () =>
          // (await connector.getProvider()).connector.uri,
          chain.rpcUrls.default,
        instructions: {
          learnMoreUrl: 'https://app.tor.us/',
          steps: [
            {
              description:
                'How do we turn this off?',
              step: 'install',
              title: 'Open the My Wallet app',
            },
            // {
            //   description:
            //     'After you scan, a connection prompt will appear for you to connect your wallet.',
            //   step: 'scan',
            //   title: 'Tap the scan button',
            // },
          ],
        },
      },
    };
  },
});