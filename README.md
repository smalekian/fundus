# Fundus

Fundus is an application used for setting up crowdfunding campaigns using smart contracts and the ethereum blockchain. Users can search for campaigns using its corresponding smart contract's address, connect their crypto wallets, and contribute ether to help active campaigns reach their funding goals.

Prerequisites:
  * [`Node.js`](https://nodejs.org/en), this application was built using v23.8.0.
  * Metamask wallet set up containing a minimum of 0.01 ETH
  * Metamask browser extension

Install dependencies:
  * `cd sc` to navigate to the Ethereum client where smart contracts can be developed, tested, and deployed.
  * `npm install` to install hardhat and its toolkit

Set up local Ethereum network:
  * `npx hardhat node` to start a local Ethereum network instance, defaults to using localhost:8545.
  * Add local Ethereum network to your Metamask extension, and configure your wallet to connect to it.
  * For assstance, see the "Adding custom network to Metamask manually" section of [this tutorial](https://support.ledger.com/article/8381031270301-zd).
  * ![Hardhat should automatically set your Chain ID to 31337](https://gist.github.com/smalekian/6336662f1d647bfe574927ee383a5d0c/raw/3aa2992b67b67ab1a5da32efffb284f4a783fe5e/fundus_readme_screenshot.png)


Deploy Crowdfunding smart contract:
  * Modify `./ignition/modules/Crowdfunding.js` to set parameters for the smart contract's constructor.
  * In a separate terminal window, `npx hardat ignition deploy ./ignition/modules/Crowdfunding.js --network localhost` to deploy the Crowdfunding smart contract. The last part of the terminal output will show a "Deployed Addresses" section containing the address of the deployed Crowdfunding smart contract.

Set up React app:
  * `cd fundus_webapp` to navigate to the simple react app.
  * `npm install` to install dependencies.
  * If you are running on a Unix-like OS, run `export NODE_OPTIONS=--openssl-legacy-provider`.
  * `npm start` to start web app on localhost:3000.
  * `npm start` to start web app on localhost:3000.

---

Using Fundus:
  * Visit [`localhost:3000`](localhost:3000).
  * Enter the deployed Crowdfunding smart contract address to go to that campaign's page.
  * At the bottom of the page displaying the smart contract's data, enter an amount of ether to contribute.
  * Once you submit, the page should refresh and display updates balances indicating your transaction went through, thereby updating the smart contract's balance.