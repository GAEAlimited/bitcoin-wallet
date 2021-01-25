import React from 'react';
import * as bitcoin from 'bitcoinjs-lib';
import * as axiosDef from 'axios';

const axios = axiosDef.default;
const TESTNET = bitcoin.networks.testnet;
const TESTNET_API_SMARTBIT =
  'https://testnet-api.smartbit.com.au/v1/blockchain/transaction/';

export const SendBTC: React.FC = () => {
  const getRawHex = (txid: string) => {
    return axios
      .get(`${TESTNET_API_SMARTBIT}${txid}/hex`)
      .then(res => {
        console.log('res.data', res.data);
        const hex = res.data.hex[0].hex || '';
        return hex;
      })
      .catch(error => {
        console.log(error);
      });
  };

  const testSend = async () => {
    const keyPair = bitcoin.ECPair.makeRandom({ network: TESTNET });
    console.log('keyPair', keyPair);
    const address = bitcoin.payments.p2pkh({
      pubkey: keyPair.publicKey,
      network: TESTNET
    });
    console.log('address', address);
    const wifString = keyPair.toWIF();
    const alice = bitcoin.ECPair.fromWIF(wifString, TESTNET);
    console.log('alice', alice);
    const psbt = new bitcoin.Psbt({ network: TESTNET });
    console.log('psbt', psbt);

    const unspentOutput = {
      txid: '49c1a69a3f7ed5c479e081e0a793c1f9093f3db524fea5b3387fd72d5442a27b',
      vout: 1,
      address: '2NCxBSjMaVeBFyxmGcD2X428v6k5n3pCQKN',
      label: 'payment',
      redeemScript: '001495a994a417c45f97c87d03efb21997452d4c782f',
      scriptPubKey: 'a914d82952189f437226406ec17c8c397a34af177cd187',
      amount: 1.0,
      confirmations: 24,
      spendable: true,
      solvable: true,
      desc:
        "sh(wpkh([7fc5659a/0'/0'/1']02284916d8cd4fdf35574d5f0aaea0c93607254b06601ef126e73d8fb075b7169f))#6k9sssw6",
      safe: true
    };
    const rawTransaction = await getRawHex(unspentOutput.txid);
    await console.log('rawTransaction', rawTransaction);
    const isSegwit = (await rawTransaction.substring(8, 12)) === '0001';
    if (isSegwit) {
      await psbt.addInput({
        hash: unspentOutput.txid,
        index: unspentOutput.vout,
        witnessUtxo: {
          script: Buffer.from(unspentOutput.scriptPubKey, 'hex'),
          value: unspentOutput.amount * 100000000 // value in satoshi
        },
        redeemScript: Buffer.from(unspentOutput.redeemScript, 'hex')
      });
    } else {
      await psbt.addInput({
        hash: unspentOutput.txid,
        index: unspentOutput.vout,
        nonWitnessUtxo: Buffer.from(rawTransaction, 'hex'),
        redeemScript: Buffer.from(unspentOutput.redeemScript, 'hex')
      });
    }
    await psbt.addOutput({
      address: '2NF3WNhdXJzgChaAZgdYjHWaAvYG25Nhz58',
      value: 0.5 * 100000000
    });
  };
  return (
    <div>
      <button onClick={() => testSend()}>test</button>
      <h3>Send BTC</h3>
      <input type='text' placeholder='To Address' />
      <br />
      <input type='text' placeholder='Amount' />
      <br />
      <button>Send</button>
    </div>
  );
};
