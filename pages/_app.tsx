import '../styles/style.css'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import Head from 'next/head';
import
 { Analytics } 
from
 
'@vercel/analytics/react'
;

const { chains, provider, webSocketProvider } = configureChains(
  [
    mainnet,
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'RainbowKit App',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        <Head>
        <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
   <link rel="icon" type="image/png" href="/favicon.ico" />
  <title>POLLINATORS</title>
  <meta name="description" content="Pollinators NFT & Flower Banners" />
        </Head>
      <center>
    <div id="header">
    <ConnectButton />
     
    </div>
  </center>
        <Component {...pageProps} />
        <Analytics />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;