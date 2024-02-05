import { Injectable } from '@angular/core';
import Web3 from 'web3';
import BN from 'bn.js';


declare let window: any;

const erc20ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
];


@Injectable({
  providedIn: 'root'
})
export class EthereumService {
  private web3: Web3;
  private accounts: string[] = [];
  public WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';


  constructor() {
    if (typeof window.ethereum !== 'undefined') {
      this.web3 = new Web3(window.ethereum);
    } else {
      console.log('Metamask not found');
      this.web3 = undefined as any;
    }
  }

  async connectAccount(): Promise<string[]> {
    if (!this.web3) {
      return Promise.reject('Web3 not initialized');
    }
    try {
      this.accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return Promise.resolve(this.accounts);
    } catch (error) {
      return Promise.reject('User denied account access');
    }
  }
  async getBalance(address: string, tokenAddress: string = '0x0'): Promise<string> {
    if (tokenAddress === '0x0') {
      const balanceInWei = await this.web3.eth.getBalance(address);
      return this.web3.utils.fromWei(balanceInWei, 'ether');
    } else {
      const contract = new this.web3.eth.Contract(erc20ABI, tokenAddress);
      const balanceResult = await contract.methods['balanceOf'](address).call();
      const decimalsResult = await contract.methods['decimals']().call();

      const balance = balanceResult !== undefined ? balanceResult.toString() : "0";
      const decimals = decimalsResult !== undefined ? decimalsResult.toString() : "18";
  
      const balanceBN = new BN(balance);
      const decimalsBN = new BN(decimals);
  
      const balanceInDecimal = balanceBN.div(new BN(10).pow(decimalsBN));

      return balanceInDecimal.toString();
    }
  }

  async transferERC20(tokenAddress: string, toAddress: string, amount: number, decimals: number): Promise<string> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }
    const contract = new this.web3.eth.Contract(erc20ABI, tokenAddress);
    const senderAddress = this.accounts[0]; 
    
    const amountInWei = new BN(amount.toString()).mul(new BN(10).pow(new BN(decimals - 18)));
  
    return new Promise((resolve, reject) => {
      contract.methods['transfer'](toAddress, amountInWei).send({ from: senderAddress })
        .on('transactionHash', hash => {
          resolve(hash);
        })
        .on('error', error => {
          reject(error);
        });
    });
  }
  
  
}
