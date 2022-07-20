import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import Head from "next/head";
import Script from "next/script";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import {
  RainbowKitProvider,
  darkTheme,
  connectorsForWallets,
  wallet,
} from "@rainbow-me/rainbowkit";
import { defaultNetwork } from "../src/utils/networkSelector";
import { calypsoHub, localhost, skaleTestnet } from "../src/utils/SkaleChains";

import "@rainbow-me/rainbowkit/styles.css";
import "@fontsource/dm-sans";
import { ChakraProvider } from "@chakra-ui/react";
import theme from '../src/utils/theme'
import { torusWallet } from "../src/browserWallet/rainbowKitTorusWallet";
import { burnerAuthWallet } from "../src/browserWallet/burner/rainbowKitBurner";

const { chains, provider } = configureChains([defaultNetwork()], [
  jsonRpcProvider({
    rpc: (chain) => {
      switch (chain.id) {
        case skaleTestnet.id:
          return { http: chain.rpcUrls.default };
        case calypsoHub.id:
          return { http: chain.rpcUrls.default };
        case localhost.id:
          return { http: chain.rpcUrls.default };
        default:
          return null;
      }
    },
  }),
]);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      burnerAuthWallet({ chains })
    ],
  },
  // {
  //   groupName: 'Supported',
  //   wallets: [
  //     wallet.metaMask({ chains }),
  //     wallet.coinbase({ chains, appName: 'Skale, Paper, Scissors' }),
  //     wallet.walletConnect({ chains }),
  //   ],
  // },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider
          chains={chains}
          theme={darkTheme({
            ...darkTheme.accentColors.orange,
            fontStack: "system",
          })}
        >
          <ChakraProvider theme={theme}>
            <Head>
              <title>SKALE, Paper, Scissors</title>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
              <meta charSet="utf-8" />
              <meta
                property="og:site_name"
                content="SKALE, Paper, Scissors"
                key="ogsitename"
              />
              <link rel="icon" href="/favicon.ico" />
              <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
              <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
              <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
              <meta
                name="description"
                content="Battle your new conference buddies, get all the items. Don't get rekt."
              />
              <meta
                property="og:title"
                content="SKALE, Paper, Scissors"
                key="ogtitle"
              />
              <meta
                property="og:description"
                content="Battle your new conference buddies, get all the items. Don't get rekt."
                key="ogdesc"
              />

              <meta name="twitter:card" content="summary" key="twcard" />

              <meta
                property="og:url"
                content="https://TBD"
                key="ogurl"
              />
            </Head>
            <Script
              strategy="afterInteractive"
              src="https://www.googletagmanager.com/gtag/js?id=G-DQFF62EC7C"
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-DQFF62EC7C');
              `,
              }}
            />
            <Component {...pageProps} />
          </ChakraProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

export default MyApp;
