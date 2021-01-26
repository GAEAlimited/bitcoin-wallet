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
  const [balance, setBalance] = useState<number>(0);
  const [lastTxHash, setLastTxHash] = useState<string>('');
  const [outputNumber, setOutputNumber] = useState<number>(0);

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
        if (balance > 0) {
          const lastTx = response.data.txs[0];
          const lastTxHash = lastTx.hash;
          const outputNumber = lastTx.outputs.findIndex(
            // @ts-ignore
            output => output.addresses[0] === address
          );
          setOutputNumber(outputNumber);
          setLastTxHash(lastTxHash);
        }
        setBalance(balance);
      })
      .catch(error => {
        console.log(error);
      });
  };

  useEffect(() => {
    let savedUserWallet = JSON.parse(localStorage.getItem('userWallet') || '');
    if (!savedUserWallet.address) {
      savedUserWallet = generateUserWallet();
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
      <SendBTC
        balance={balance}
        txid={lastTxHash}
        outputNumber={outputNumber}
        network={TESTNET}
        wif={userWallet.wif}
      />
    </>
  );
};

export default App;
