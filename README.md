# Auction House

Current contract address:
* Ropsten - [`0x2603f999e632FAaC9e87De608197E6eb9a672b2a`](https://ropsten.etherscan.io/address/0x2603f999e632FAaC9e87De608197E6eb9a672b2a)

## Prerequisites
* Node.js >= 14v
* Truffle
* Ganache
* Solidity v0.8.0

## Development

### Connecting with Ropsten
Copy `env-example` to `.env`, then fill in the `MNEMONIC` and `INFURA_URL` variables to use when interacting with Ropsten.

## Local Testing

### Smart Contract Unit Tests
The smart contract `AuctionHouse.sol` may be tested locally with the unit tests in `test/`.

To run the unit tests associated with `AuctionHouse.sol` run the following:
```
npm install
ganache-cli # ensure it is listening on 8545
truffle test
```

## Project Description
This Dapp is a primitive auction house. A user may create items to auction, place a bid on an existing item, or close one of their auctions.
