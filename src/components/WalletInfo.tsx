import React from 'react';

interface WalletProps {
  address: string;
  balance: number;
}

export const WalletInfo: React.FC<WalletProps> = props => {
  return (
    <div>
      <p>Address: {props.address}</p>
      <p>Balance: {props.balance} BTC</p>
    </div>
  );
};
