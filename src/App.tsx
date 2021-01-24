import React, { useEffect, useState } from 'react';
import * as bitcoin from 'bitcoinjs-lib';

const TESTNET = bitcoin.networks.testnet;


const App: React.FC = () => {
  const [pubAddress, setPubAddress] = useState('');

  const generateAddress = () => {
    const keyPair = bitcoin.ECPair.makeRandom({ network: TESTNET });
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: TESTNET,
    });
    return address;
  }

  useEffect(() => {
    const saved = localStorage.getItem('pubAddress') || generateAddress();
    console.log(saved);
    setPubAddress(saved);
  }, [])

  useEffect(() => {
    localStorage.setItem('pubAddress', pubAddress)
  }, [pubAddress])


  return (
    <div>
      {pubAddress}
    </div> 
  );
}

export default App;
