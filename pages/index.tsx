import type { NextPage } from 'next';
import { useAccount, usePrepareContractWrite, useContractRead } from 'wagmi'
import abi from '../pages/abi/flwrs.json';
import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { ethers } from 'ethers';


const Home: NextPage = () => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [totalMinted, setTotalMinted] = React.useState(0);
  const { isConnected } = useAccount();
  
  const provider = typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
  ? new ethers.providers.Web3Provider(window.ethereum, "any")
  : null;
  
  const address = "0xD6d503f0f788f3c2D553bE0b5460Ba4E2798044D"
    
    const { config } = usePrepareContractWrite({
      address,
      abi
    })
    
    const contract = {
      address,
      abi
    };
    
    async function connect() {
      if (provider === null) {
        throw new Error('Provider is null');
      }
    
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      return signer;
    }
    
    async function getMaxQuantity() {
      const signer = await connect();
      if (provider === null) {
        // Handle the case where provider is null
        // You can throw an error, return a default value, or handle it as per your requirements
        throw new Error('Provider is null');
      }
      const nftContract = new ethers.Contract(contract.address, contract.abi, provider);
    
      let maxQuantity = 0;
    
      // check invite limit
      let invite = await nftContract.invites(ethers.constants.HashZero);
      let limit = invite['limit']; // Access the 'limit' value directly
    
      // Convert the 'limit' value to a number using parseInt or Number
      let limitNumber = parseInt(limit);
      // Or: let limitNumber = Number(limit);
    
      let currentBalance = await nftContract.balanceOf(signer.getAddress());
      maxQuantity = limitNumber - currentBalance;
    
      // check max batch size
      let config = await nftContract.config();
      let maxBatch = config['maxBatchSize'];
      maxQuantity = maxQuantity < maxBatch? maxQuantity: maxBatch;
    
      // check contract max supply
      let maxSupply = config['maxSupply'];
      let curSupply = await nftContract.totalSupply();
      let diff = maxSupply - curSupply;
    
      maxQuantity = maxQuantity < diff? maxQuantity: diff;
      return maxQuantity
    }
    
    // mint from public invite list
    async function mintPublic(quantity: number, callback: (success: boolean) => void) {
      const signer = await connect();
      const nftContract = new ethers.Contract(contract.address, contract.abi, signer);
    
      if(quantity > await getMaxQuantity()) {
        console.log('Max quantity exceeded');
        callback(false);
        return
      }
    
      let invite = await nftContract.invites(ethers.constants.HashZero);
    
      let price = (invite['price'] * quantity).toString();
      let auth = [ethers.constants.HashZero, []];
      let affiliate = ethers.constants.AddressZero;
      let affiliateSigner = ethers.constants.HashZero;
    
      let estimatedGas = 200000;
      try {
        const estimatedGasFromContract = await nftContract.estimateGas.mint(
          auth, quantity, affiliate, affiliateSigner, {value: price, gasLimit: 0 });
        estimatedGas = estimatedGasFromContract.toNumber();
      } catch (error) {
        console.log('User has insufficient funds for mint');
        console.log(error);
      }
    
      try {
        const tx = await nftContract.mint(auth, quantity, affiliate, affiliateSigner, {value: price, gasLimit: estimatedGas });
        console.log(`Transaction hash: ${tx.hash}`);
    
        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        console.log(`Gas used: ${receipt.gasUsed.toString()}`);
        callback(true);
      } catch (error) {
        console.log('rejected mint');
        console.log(error);
        callback(false)
      }
    }

    const handleMintPublicClick = async () => {
      const quantity = 1;
      // Call the mintPublic function and handle the result
      await mintPublic(quantity, (success) => {
        if (success) {
          // Handle successful minting
          console.log('Minting successful');
        } else {
          // Handle failed minting
          console.log('Minting failed');
        }
      });
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

  const videoUrl = "https://itsnota.club/pllntrs/web-bg.mp4";
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
   <link rel="icon" type="image/png" href="/favicon.ico" />
  <title>POLLINATORS</title>
  <meta name="description" content="Pollinators NFT & Flower Banners" />
  <div className="loader-wrapper">
    <div className="bar-container">
      <div className="bar" />
    </div>
  </div>
 
  <center>
  
  <div className="main">
  <div className="banner"><img
          src="https://itsnota.club/pllntrs/web-banner.gif"
          alt="Banners"
        />
        </div>
    <div className="desc">
      <>
      <p>Immerse yourself in a captivating world of the graceful pollinators. Flower Banners is an NFT project expanding on the <a href='https://opensea.io/collection/the-pollinators' target='_blank' rel="noreferrer" >The Pollinators</a> collection. Combining breathtaking flower photographs with the delicate dance of the pollinators, these unique banners offer an enchanting celebration of nature&apos;s wonders.</p>

      </>
  </div>

  <h1>{totalMinted} / 1333</h1>
  {mounted && isConnected &&(
    <>
    <p>Click the button below to mint</p>
   <button className="button" onClick={handleMintPublicClick}>
      Mint Now
    </button>
            </>
    
  )}
  
<br />
<p>Connect to mint or mint on <a href="https://www.scatter.art/flower-banners" target="_blank" rel="noreferrer">Scatter.art</a> 
<br/> </p>


  </div>
  </center>


  <center>
    <div
      className="mintLinks"
      
    >
      <a href="https://opensea.io/collection/flower-banners" target="_blank" rel="noreferrer">
        <img
          src="https://itsnota.club/imgs/opensea.svg"
          style={{ width: 25, margin: 15 }}
          alt="OpenSea"
        />
      </a>
      <a href="https://twitter.com/Pollinators_NFT" target="_blank" rel="noreferrer">
        <img
          src="https://itsnota.club/imgs/twitter-logo.png"
          style={{ width: 25, margin: 15 }}
          alt="Twitter"
        />
      </a>
      <a
        href="https://etherscan.io/address/0xD6d503f0f788f3c2D553bE0b5460Ba4E2798044D"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="https://itsnota.club/imgs/etherscan.svg"
          style={{ width: 25, margin: 15 }}
          alt="etherscan"
        />
      </a>
<p>Copyleft (ɔ) under the <a href="https://viralpubliclicense.org/">VIRAL PUBLIC LICENSE</a></p>
   
    </div>
  </center>
  <div id="background-wrap">
  <video ref={videoRef} src={videoUrl} autoPlay loop muted/>

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
};
export default Home;
