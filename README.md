# NFT Trading Site

## Prerequisites
* Node.js >= 14v
* Truffle
* Ganache
* Solidity v0.8.0

## Local Testing

### Smart Contracts
1. Run `npm install`
2. Run `ganache-cli`, ensure it is listening on port `8545`
3. Run `truffle test`
`

## Project Description
The goal of this project is to create a site where users can create trades for NFTs.

NFTs are a big craze right now and while there are many places were you can go to auction or buy NFTs there isn't much mentioned about trading an NFT for another NFT which can be a big part of other "collector" type things.

For the site a user, Alice,  will be able to choose one of their NFTs, X, to create a trade with. Then they will be able to specify a different NFT, Y,  they would like to receive for X. When the trade is created a smart contract will be deployed and X will be sent to the smart contract. Then Alice can send a link to the owner of Y, Bob, to request the trade. If Bob sends Y to the smart contract, then the contract will swap the NFTs giving Alice Y and Bob X. If Bob doesn't want to do the trade or takes longer than Alice likes Alice can cancel the trade to have the smart contract send X back to her.
