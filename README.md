# Auction House

Deployed UI: https://auction-house-dapp.vercel.app/

Current contract address:
* Ropsten - [`0xF7F4397F4A637b001361344736015fAd438ECc57`](https://ropsten.etherscan.io/address/0xF7F4397F4A637b001361344736015fAd438ECc57)

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
truffle test test/auctionhouse.test.js
```

## Public Ethereum wallet for Cert
`0xD7A00CA90D1Ab5C4084B87Dd817E8a6F48009275`

## Project Description
*Note*: I pivoted from my original idea because the frontend for my NFT Swap idea was going to be way too difficult for me (I have no frontend experience) so I switch to making an Auction house. I had already finished the smart contract for the NFT Swap and I'm admittedly pretty proud of it due to having to get test NFTs to work for the unit tests so I've kept it in the repo.

This Dapp is a primitive auction house.

In this dapp, a user is able to see all the open auctions without having to connect their wallet but if they wish to create or bid then they must connect.

Once connected a user will have the open to create a new auction item or place a bid on an existing item.

If the user chooses to create a new auction then they must input a name and description for the auction.

Only the creator of the auction item will be able to close the auction.

## Directory Structure
* `contracts` - Solidity contracts
* `dapp` - vanilla JS and HTML for the dapp
* `migrations` - migration scripts
* `test` - folder for unit tests
