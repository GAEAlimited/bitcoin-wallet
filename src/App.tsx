import React, { useState, useEffect } from 'react';
import { SendBTC } from './components/SendBTC';
import { WalletInfo } from './components/WalletInfo';
import * as axiosDef from 'axios';
import * as bitcoin from 'bitcoinjs-lib';

const axios = axiosDef.default;
const TESTNET = bitcoin.networks.testnet;
const TESTNET_API_ADDRESS = 'https://api.blockcypher.com/v1/btc/test3/addrs/';

interface UserWallet {
  address: string;
  wif: string;
}

const App: React.FC = () => {
  const [userWallet, setUserWallet] = useState<UserWallet>({
    address: '',
    wif: ''
  });
  const [balance, setBalance] = useState(0);

  const generateUserWallet = () => {
    const keyPair = bitcoin.ECPair.makeRandom({ network: TESTNET });
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: TESTNET
    });
    const wif = keyPair.toWIF();
    const newUserWallet = {
      address,
      wif
    };
    return newUserWallet;
  };

  const getWalletInfo = (address: string) => {
    axios
      .get(`${TESTNET_API_ADDRESS}${address}/full`, {
        params: {
          limit: 50
        }
      })
      .then(response => {
        const balance = response.data.balance / 10 ** 8;
        setBalance(balance);
      })
      .catch(error => {
        console.log(error);
      });
  };

  useEffect(() => {
    let savedUserWallet = JSON.parse(localStorage.getItem('userWallet') || '');
    console.log('qwerty', savedUserWallet);
    if (!savedUserWallet.address) {
      savedUserWallet = generateUserWallet();
      console.log('eweewrwe', savedUserWallet);
    }
    setUserWallet(savedUserWallet);
  }, []);

  useEffect(() => {
    localStorage.setItem('userWallet', JSON.stringify(userWallet));
    userWallet.address && getWalletInfo(userWallet.address);
  }, [userWallet]);
  return (
    <>
      <WalletInfo address={userWallet.address} balance={balance} />
      {balance ? <SendBTC /> : <p>You need some BTC for make transaction</p>}
    </>
  );
};

export default App;
