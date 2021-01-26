import React, { useState } from 'react';
import * as bitcoin from 'bitcoinjs-lib';
import * as axiosDef from 'axios';

const axios = axiosDef.default;
const SMARTBIT_API = 'https://testnet-api.smartbit.com.au/v1/blockchain';

const TESTNET_EXPLORER = 'https://live.blockcypher.com/btc-testnet/tx/';

interface SendBTCProps {
  balance: number;
  txid: string;
  outputNumber: number;
  network: bitcoin.networks.Network;
  wif: string;
}

export const SendBTC: React.FC<SendBTCProps> = props => {
  const { balance, txid, outputNumber, network, wif } = props;

  const [amount, setAmount] = useState(0);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [sentTxId, setSentTxId] = useState('');

  const onSendClick = () => {
    const minerFee = 10000;
    const outputAmount = amount * 1e8 - minerFee;
    const keyPair = bitcoin.ECPair.fromWIF(wif, network);
    const txb = new bitcoin.TransactionBuilder();
    txb.network = network;
    txb.addInput(txid, outputNumber);
    txb.addOutput(destinationAddress, outputAmount);
    txb.sign(0, keyPair);
    const hex = txb.build().toHex();
    axios
      .post(`${SMARTBIT_API}/pushtx`, {
        hex: hex
      })
      .then(res => {
        const txid = res.data.txid;
        setSentTxId(txid);
      });
  };

  const changeAmountHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setAmount(value);
  };

  const changeDestinationAddressHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDestinationAddress(event.target.value);
  };

  if (balance === 0) {
    return (
      <div>
        <h3>You need some BTC for make transaction.</h3>
        <p>
          Please copy your address and go to{' '}
          <a href='https://coinfaucet.eu/en/btc-testnet/' target='blank'>
            this testnet faucet
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3>Send BTC</h3>
      <input
        type='text'
        placeholder='To Address'
        value={destinationAddress}
        onChange={changeDestinationAddressHandler}
      />
      <br />
      <input
        type='number'
        placeholder='Amount'
        value={amount}
        onChange={changeAmountHandler}
      />
      <br />
      <button onClick={onSendClick}>Send</button>
      <br />
      {sentTxId && (
        <p>
          You have sent BTC successful and can check transaction status{' '}
          <a href={`${TESTNET_EXPLORER}${sentTxId}`} target='blank'>
            here
          </a>
        </p>
      )}
    </div>
  );
};
