import '../styles/style.css'
import '@rainbow-me/rainbowkit/styles.css'

import type { AppProps } from 'next/app'
import Head from 'next/head'

import { ConnectButton, RainbowKitProvider, darkTheme, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'

const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [mainnet],
  ssr: true,
})

const queryClient = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
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
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default MyApp
