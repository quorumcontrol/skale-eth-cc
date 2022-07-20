import { Wallet } from "@rainbow-me/rainbowkit";
import { defaultNetwork } from "../../utils/networkSelector";
import { BurnerConnector } from "./burnerConnector";

const chain = defaultNetwork()

export const burnerAuthWallet = ({ chains }: any): Wallet => ({
  id: 'burnerWallet',
  name: 'Burner (No Signing)',
  iconUrl: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/whatsapp/326/fire_1f525.png',
  iconBackground: '#0c2f78',
  downloadUrls: {
    android: '',
    ios: '',
    qrCode: '',
  },

  createConnector: () => {
    const connector = new BurnerConnector({ chains })
    return {
      connector,
      installed: true,
      mobile: {
        getUri: async () => {
          // const { uri } = (await connector.getProvider()).connector;
          return chain.rpcUrls.default
        },
      },
    };
  },
});