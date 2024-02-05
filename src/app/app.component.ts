import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EthereumService } from './ethereum.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  address: string = '';
  
  ethBalance: string = '';
  wethBalance: string = '';

  transactionHash: string = '';
  tokenAddress: string = '';
  recipientAddress: string = '';
  amount: number = 0;
  decimals: number = 18; 
  

  constructor(private ethService: EthereumService) {}

  connectMetamask(): void {
    this.ethService.connectAccount().then(accounts => {
      this.address = accounts[0];
      this.getEthBalance();
      this.getWethBalance();
    }).catch(error => {
      console.error(error);
    });
  }

  getEthBalance(): void {
    this.ethService.getBalance(this.address, '0x0').then(balance => {
      this.ethBalance = balance;
    }).catch(error => {
      console.error(error);
    });
  }

  getWethBalance(): void {
    this.ethService.getBalance(this.address, this.ethService.WETH_ADDRESS).then(balance => {
      this.wethBalance = balance;
    }).catch(error => {
      console.error(error);
    });
  }

  transferToken(tokenAddress: string, recipient: string, amount: number, decimals: number): void {
    this.ethService.transferERC20(tokenAddress, recipient, amount, decimals)
      .then(hash => {
        console.log('Transaction hash:', hash);
        this.transactionHash = hash;
      })
      .catch(error => {
        console.error('Transaction error:', error);
      });
  }
  
}

