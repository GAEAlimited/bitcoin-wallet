import { networks } from 'bitcoinjs-lib'

export interface WalletProps {
    address: string;
    balance: number;
  }

export interface SendBTCProps {
    balance: number;
    txid: string;
    outputNumber: number;
    network: networks.Network;
    wif: string;
  }

  export  interface UserWallet {
    address: string;
    wif: string;
  }