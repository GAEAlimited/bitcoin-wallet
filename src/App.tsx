import React, { useEffect, useState } from 'react';
import * as bitcoin from 'bitcoinjs-lib';
import * as axiosDef from "axios";

const axios = axiosDef.default;
const TESTNET = bitcoin.networks.testnet;
const TESTNET_API_ADDRESS = 'https://api.blockcypher.com/v1/btc/test3/addrs/';


const App: React.FC = () => {
  const [pubAddress, setPubAddress] = useState('');
  const [balance, setBalance] = useState(0);

  const generateAddress = () => {
    const keyPair = bitcoin.ECPair.makeRandom({ network: TESTNET });
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: TESTNET,
    });
    return address;
  }

  const getBalance = (pubAddress: string) => {
    axios.get(`${TESTNET_API_ADDRESS}${pubAddress}/full`, {
      params: {
        limit: 50
      }
    }).then(response => {
      const balance = response.data.balance / 10**8;
      setBalance(balance)
    }).catch(error => {
      console.log(error);
    })
  }

  useEffect(() => {
    const savedAddress = localStorage.getItem('pubAddress') || generateAddress();
    getBalance(savedAddress);
    setPubAddress(savedAddress);
  }, [])

  useEffect(() => {
    localStorage.setItem('pubAddress', pubAddress)
  }, [pubAddress])


  return (
    <div>
      <p>Address: {pubAddress}</p>
      <p>Balance: {balance} BTC</p>
    </div> 
  );
}

export default App;
