# Design Patter Decisions

## Inheritance
The contract inherits `Ownable` to allow the contract owner to cancel auctions.

## Role Based Access Control
The contract owner is able to cancel auctions using the `onlyOwner` modifier from `Ownable`. Also auction creators are the only ones who may close an auction.
