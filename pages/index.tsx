import type { NextPage } from 'next'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import abi from '../pages/abi/flwrs.json'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = '0xD6d503f0f788f3c2D553bE0b5460Ba4E2798044D' as const

const Home: NextPage = () => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [totalMinted, setTotalMinted] = useState(0)
  const { isConnected } = useAccount()

  // Ethers v6 provider (memoized)
  const provider = useMemo(() => {
    if (typeof window === 'undefined') return null
    const eth = (window as any).ethereum
    if (!eth) return null
    return new ethers.BrowserProvider(eth)
  }, [])

  const contract = useMemo(
    () => ({
      address: CONTRACT_ADDRESS,
      abi,
    }),
    []
  )

  async function connect() {
    if (!provider) throw new Error('Provider is null')
    await provider.send('eth_requestAccounts', [])
    return await provider.getSigner()
  }

  async function getMaxQuantity(): Promise<number> {
    if (!provider) throw new Error('Provider is null')

    const signer = await connect()
    const signerAddress = await signer.getAddress()

    const nftContract = new ethers.Contract(contract.address, contract.abi, provider)

    // v6 returns bigint for uints
    const invite = await nftContract.invites(ethers.ZeroHash)
    const limit: bigint = invite.limit

    const currentBalance: bigint = await nftContract.balanceOf(signerAddress)

    let maxQuantity: bigint = limit - currentBalance
    if (maxQuantity < 0n) maxQuantity = 0n

    const cfg = await nftContract.config()
    const maxBatch: bigint = cfg.maxBatchSize
    if (maxQuantity > maxBatch) maxQuantity = maxBatch

    const maxSupply: bigint = cfg.maxSupply
    const curSupply: bigint = await nftContract.totalSupply()
    const remaining: bigint = maxSupply - curSupply
    if (remaining < 0n) return 0
    if (maxQuantity > remaining) maxQuantity = remaining

    // convert to number for UI / input (safe if values are small)
    return Number(maxQuantity)
  }

  async function mintPublic(quantity: number, callback: (success: boolean) => void) {
    try {
      const signer = await connect()
      const nftContract = new ethers.Contract(contract.address, contract.abi, signer)

      const maxQ = await getMaxQuantity()
      if (quantity > maxQ) {
        console.log('Max quantity exceeded')
        callback(false)
        return
      }

      const invite = await nftContract.invites(ethers.ZeroHash)
      const unitPrice: bigint = invite.price

      const qty = BigInt(quantity)
      const value: bigint = unitPrice * qty

      const auth: [string, any[]] = [ethers.ZeroHash, []]
      const affiliate = ethers.ZeroAddress
      const affiliateSigner = ethers.ZeroHash

      // estimate gas (v6: estimateGas returns bigint)
      let gasLimit: bigint = 200_000n
      try {
        const estimated = await nftContract.mint.estimateGas(auth, quantity, affiliate, affiliateSigner, {
          value,
        })
        gasLimit = estimated
      } catch (error) {
        console.log('Gas estimate failed (maybe insufficient funds or revert)')
        console.log(error)
      }

      const tx = await nftContract.mint(auth, quantity, affiliate, affiliateSigner, {
        value,
        gasLimit,
      })
      console.log(`Transaction hash: ${tx.hash}`)

      const receipt = await tx.wait()
      console.log(`Transaction confirmed in block ${receipt.blockNumber}`)
      console.log(`Gas used: ${receipt.gasUsed?.toString?.() ?? ''}`)
      callback(true)
    } catch (error) {
      console.log('rejected mint')
      console.log(error)
      callback(false)
    }
  }

  const handleMintPublicClick = async () => {
    const quantity = 1
    await mintPublic(quantity, (success) => {
      console.log(success ? 'Minting successful' : 'Minting failed')
    })
  }

  // wagmi v2 read: returns bigint
  const { data: totalSupplyData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'totalSupply',
  })

  useEffect(() => {
    if (totalSupplyData != null) {
      setTotalMinted(Number(totalSupplyData))
    }
  }, [totalSupplyData])

  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) audio.pause()
    else audio.play()
    setIsPlaying(!isPlaying)
  }

  const videoUrl = 'https://itsnota.club/pllntrs/web-bg.mp4'
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.autoplay = true
    video.loop = true
    video.muted = true
  }, [])

  return (
    <>
      <div className="loader-wrapper">
        <div className="bar-container">
          <div className="bar" />
        </div>
      </div>

      <center>
        <div className="main">
          <div className="banner">
            <img src="https://itsnota.club/pllntrs/web-banner.gif" alt="Banners" />
          </div>

          <div className="desc">
            <p>
              Immerse yourself in a captivating world of the graceful pollinators. Flower Banners is an NFT project
              expanding on the{' '}
              <a
                href="https://market.pollinators.art/explore/ETHEREUM:0x644baae5c9e497cbca266c70d7d3a0efb61f9cd1"
                target="_blank"
                rel="noreferrer"
              >
                The Pollinators
              </a>{' '}
              collection. Combining breathtaking flower photographs with the delicate dance of the pollinators, these
              unique banners offer an enchanting celebration of nature&apos;s wonders.
            </p>
          </div>

          <h1>
            {totalMinted} / 333
          </h1>

          {mounted && isConnected && (
            <>
              {/* Add your mint UI wherever you want */}
              <button onClick={handleMintPublicClick}>Mint 1</button>
            </>
          )}

          <br />
          <p>Check out the Pollinators Market or Sudoswap for secondary sales.</p>

          <div className="banner">
            <a href="https://market.pollinators.art" target="_blank" rel="noreferrer">
              <img src="https://itsnota.club/pllntrs/market-ad.png" alt="Pollinators Market" />
            </a>
          </div>

          <div className="banner">
            <a
              href="https://sudoswap.xyz/#/browse/buy/0xd6d503f0f788f3c2d553be0b5460ba4e2798044d"
              target="_blank"
              rel="noreferrer"
            >
              <img src="https://itsnota.club/pllntrs/fb-sudoswap.png" alt="Flower Banners on Sudoswap" />
            </a>
          </div>
        </div>
      </center>

      <center>
        <div className="mintLinks">
          <a href="https://opensea.io/collection/flower-banners" target="_blank" rel="noreferrer">
            <img src="https://itsnota.club/imgs/opensea.svg" style={{ width: 25, margin: 15 }} alt="OpenSea" />
          </a>
          <a href="https://twitter.com/Pollinators_NFT" target="_blank" rel="noreferrer">
            <img src="https://itsnota.club/imgs/twitter-logo.png" style={{ width: 25, margin: 15 }} alt="Twitter" />
          </a>
          <a
            href="https://etherscan.io/address/0xD6d503f0f788f3c2D553bE0b5460Ba4E2798044D"
            target="_blank"
            rel="noreferrer"
          >
            <img src="https://itsnota.club/imgs/etherscan.svg" style={{ width: 25, margin: 15 }} alt="etherscan" />
          </a>
          <p>
            Copyleft (ɔ) under the <a href="https://viralpubliclicense.org/">VIRAL PUBLIC LICENSE</a>
          </p>
        </div>
      </center>

      <div id="background-wrap">
        <video ref={videoRef} src={videoUrl} autoPlay loop muted />
      </div>

      <audio
        src="https://itsnota.club/pllntrs/born2flyOPD.mp3"
        ref={audioRef}
        loop
        onEnded={() => setIsPlaying(false)}
      />

      <button className={`play-pause-btn ${isPlaying ? 'playing' : ''}`} onClick={togglePlay}>
        <span className="play-icon"></span>
        <span className="pause-icon"></span>
      </button>
    </>
  )
}

export default Home
