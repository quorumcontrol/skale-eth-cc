import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import Head from "next/head";
import Script from "next/script";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  connectorsForWallets,
  wallet,
} from "@rainbow-me/rainbowkit";
import { activeChain, chainEnvs } from "../src/utils/networkSelector";
import { localhost, skaleTestnet } from "../src/utils/SkaleChains";

import "@rainbow-me/rainbowkit/styles.css";
import "@fontsource/dm-sans";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { setupMobileBrowserWallet } from "../src/utils/mobileBrowserWallet";

setupMobileBrowserWallet()

const needsInjectedWalletFallback =
  typeof window !== 'undefined' &&
  window.ethereum &&
  !window.ethereum.isMetaMask &&
  !window.ethereum.isCoinbaseWallet;

function getChain() {
  switch (activeChain) {
    case chainEnvs.local:
      return [localhost];
    case chainEnvs.test:
      return [skaleTestnet];
    default:
      throw new Error("unsupported env for now");
  }
}

const { chains, provider } = configureChains(getChain(), [
  jsonRpcProvider({
    rpc: (chain) => {
      switch (chain.id) {
        case skaleTestnet.id:
          return { http: chain.rpcUrls.default };
        case localhost.id:
          return { http: chain.rpcUrls.default };
        // case skaleMainnet.id:
        //     return { http: chain.rpcUrls.default };
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
      wallet.metaMask({ chains }),
      wallet.coinbase({ chains, appName: 'Skale, Paper, Scissors' }),
      wallet.walletConnect({ chains }),
      ...(needsInjectedWalletFallback
        ? [wallet.injected({ chains })]
        : []),
    ],
  },
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
              <title>Skale, Paper, Scissors</title>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
              <meta charSet="utf-8" />
              <meta
                property="og:site_name"
                content="Skale, Paper, Scissors"
                key="ogsitename"
              />
              <link rel="icon" href="/favicon.ico" />
              <meta
                name="description"
                content="Generate badges for the warriors attending your events."
              />
              <link rel="icon" href="/favicon.ico" />
              <meta
                property="og:title"
                content="Skale, Paper, Scissors"
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
