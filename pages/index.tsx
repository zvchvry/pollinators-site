import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import { useAccount, usePrepareContractWrite, useContractWrite, useContractRead } from 'wagmi'
import abi from '../pages/abi/flwrs.json';
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import Web3 from "web3";
import { ethers } from 'ethers';
import { useDebounce } from 'usehooks-ts'


const Home: NextPage = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [totalMinted, setTotalMinted] = React.useState(0);
  const { isConnected, address } = useAccount();
  const payableAmount = useDebounce(0.01)
  const payableAmountAllow = useDebounce(0)


   const { config } = usePrepareContractWrite({
      address: "0xD6d503f0f788f3c2D553bE0b5460Ba4E2798044D",
      abi,
     
    })
    const maxGas = ethers.BigNumber.from(200000);

    const { config: preMint } = usePrepareContractWrite({
      ...config,
      functionName: 'publicMint',
      overrides: {
        value: ethers.utils.parseEther(payableAmount.toString()),
        gasLimit: maxGas,
      },
      

    })
    const { config: preAllowMint } = usePrepareContractWrite({
      ...config,
      functionName: 'allowListMint',
      overrides: {
        value: ethers.utils.parseEther(payableAmountAllow.toString()),
        gasLimit: maxGas,
      },
      

    })

const [mintLoading, setMintLoading] = useState(false);
const [mintedTokenId, setMintedTokenId] = useState<number>();


const { writeAsync: mint, error: mintError } = useContractWrite({
  ...preMint,
  
});
const { writeAsync: allowMint, error: allowMintError } = useContractWrite({
  ...preAllowMint,
  
});

const onMintClick = async () => {
  try {
    setMintLoading(true);
    if (!mint) {
      throw new Error('mint function is not defined');
    }
    const tx = await mint();
    const receipt = await tx.wait();
    console.log('TX receipt', receipt);
    // @ts-ignore
    const mintedTokenId = await receipt.events[0].args[2].toString();
    setMintedTokenId(mintedTokenId);
  } catch (error) {
    console.error(error);
    if (mintError) {
      console.error(mintError);
    }
  } finally {
    setMintLoading(false);
  }
};

const onAllowMintClick = async () => {
  try {
    setMintLoading(true);
    if (!allowMint) {
      throw new Error('mint function is not defined');
    }
    const tx = await allowMint();
    const receipt = await tx.wait();
    console.log('TX receipt', receipt);
    // @ts-ignore
    const mintedTokenId = await receipt.events[0].args[2].toString();
    setMintedTokenId(mintedTokenId);
  } catch (error) {
    console.error(error);
    if (mintError) {
      console.error(mintError);
    }
  } finally {
    setMintLoading(false);
  }
};




const { data: totalSupplyData }: any = useContractRead({
  ...config,
  functionName: 'totalSupply',
  watch: true,
});
React.useEffect(() => {
  if (totalSupplyData) {
    setTotalMinted(totalSupplyData.toNumber());
  }
}, [totalSupplyData]);


const audioRef = useRef<HTMLAudioElement>(null);
const [isPlaying, setIsPlaying] = useState(false);

const togglePlay = () => {
  const audio = audioRef.current;

  if (audio !== null) {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }
};

  const videoUrl = "none";
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
  
    if (video !== null) {
      video.autoplay = true;
      video.loop = true;
      video.muted = true; // enable autoplay on most browsers

    }
  }, []);

  return (
    <>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
  <link rel="icon" type="image/png" href="https://itsnota.club/imgs/favicon.png" />
  <title>POLLINATORS</title>
  <meta name="description" content="Pollinators NFT & Flower Banners" />
  <div className="loader-wrapper">
    <div className="bar-container">
      <div className="bar" />
    </div>
  </div>
 
  <center>
  
  <div className="main">
  <h1>{totalMinted} / 1333</h1>
  {mounted && isConnected && address &&(
    <button 
    className='button-12'
    onClick={() => onMintClick?.()}
    >
      Mint Ξ0.01
    </button>
    
  )}
  {mounted && isConnected && address &&(
    <button 
    className='button-12'
    onClick={() => onAllowMintClick?.()}
    >
      Allow List
    </button>
    
  )}
  {mintLoading && <p>Minting... please wait</p>}
  {mintError && (
        <p>⛔️ Mint unsuccessful!</p>
      )}
{mintedTokenId && (
        <p>
          Success! View your Hooligan {' '}
          <a
            href="https://opensea.io/assets/ethereum/0x3664CCec2ce76e2921A6f479882baeB4ada4D6A9/{(mintedTokenId)}"
            color='orange'
          >
            here!
          </a>
        </p>
      )}

<br />
<p>Mint on <a href="https://www.scatter.art/flower-banners" target="_blank" rel="noreferrer">Scatter.art</a> 
<br/> </p>


  </div>
  </center>
  <center>
    <div
      className="mintLinks"
      
    >
      <a href="https://opensea.io/collection/those-damn-hooligans" target="_blank" rel="noreferrer">
        <img
          src="https://itsnota.club/imgs/opensea.svg"
          style={{ width: 25, margin: 15 }}
          alt="OpenSea"
        />
      </a>
      <a href="https://twitter.com/itsnotaclub" target="_blank" rel="noreferrer">
        <img
          src="https://itsnota.club/imgs/twitter-logo.png"
          style={{ width: 25, margin: 15 }}
          alt="Twitter"
        />
      </a>
      <a
        href="https://etherscan.io/address/0x3664CCec2ce76e2921A6f479882baeB4ada4D6A9"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="https://itsnota.club/imgs/etherscan.svg"
          style={{ width: 25, margin: 15 }}
          alt="etherscan"
        />
      </a>

   
    </div>
  </center>
  <div id="background-wrap">
  <video ref={videoRef} src={videoUrl} autoPlay loop muted/>

</div>
<audio
        src="https://itsnota.club/hlgns/rain2.mp3"
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
};
export default Home;
