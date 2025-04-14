import Web3 from 'web3';
import crowdfundingAbi from './crowdfundingAbi.js';

export function getWeb3() {
  return new Web3(window.ethereum);
}

export async function getContract(web3, contractAddress, defaultAccount) {
  return new web3.eth.Contract(crowdfundingAbi, contractAddress, { from: defaultAccount, gas: 10000000000000, chain: 31337 })
}