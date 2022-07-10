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
} from "@rainbow-me/rainbowkit";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { activeChain, chainEnvs } from "../src/utils/networkSelector";
import { localhost, skaleTestnet } from "../src/utils/SkaleChains";

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

const { connectors } = getDefaultWallets({
  appName: "Delph's Table",
  chains,
});

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
              <title>Crypto Colosseum: Delph's Table</title>
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
              />
              <meta charSet="utf-8" />
              <meta
                property="og:site_name"
                content="Crypto Colosseum: Delph's Table"
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
                content="Crypto Colosseum: Delph's Table"
                key="ogtitle"
              />
              <meta
                property="og:description"
                content="Generate badges for the warriors attending your events."
                key="ogdesc"
              />

              <meta name="twitter:card" content="summary" key="twcard" />
              <meta
                name="twitter:creator"
                content="@larva_maiorum"
                key="twhandle"
              />

              <meta
                property="og:url"
                content="https://delphs.larvamaiorum.com"
                key="ogurl"
              />
            </Head>
            <Script
              strategy="afterInteractive"
              src="https://www.googletagmanager.com/gtag/js?id=G-VF4GZ76QZK"
            />
            <Script
              id="gtag-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-VF4GZ76QZK', {
                  page_path: window.location.pathname,
                });
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
