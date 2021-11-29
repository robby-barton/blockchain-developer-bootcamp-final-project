// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Auction House
/// @author Robby Barton
/// @notice This contract is a basic auction house.
/// @dev Everything is currently implemented for the basic functions.
contract AuctionHouse is Ownable {
	/// @notice Number of auctions currently held by the contract. Includes completed/canceled.
	uint public totalAuctions;
	/// @notice List of auctions.
	mapping (uint => AuctionItem) public auctions;

	struct Bidder {
		address payable bidder;
		uint bid;
	}

	struct AuctionItem {
		uint itemId;
		string name;
		string description;
		uint numBids;
		mapping (uint => Bidder) bids;
		address winner;
		uint winningBid;
		address payable creator;
	}

	modifier isCreator(address _address) {
		require(msg.sender == _address);
		_;
	}

	modifier isOpen(uint _itemId) {
		require(auctions[_itemId].winner == address(0), "Item not available to bid.");
		_;
	}

	modifier validItem(uint _itemId) {
		require(_itemId < totalAuctions, "Item is not valid.");
		_;
	}

	modifier hasValue() {
		require(msg.value > 0, "Bid should be higher than 0.");
		_;
	}

	constructor() {}

	/// @notice Create a new AuctionItem and add it to the auctions list.
	/// @param _name The name of the item up for auction.
	/// @param _description A short description of the item.
	/// @return The itemId of the object.
	function createAuction(string memory _name, string memory _description) public returns (uint) {
		AuctionItem storage _item = auctions[totalAuctions];
		_item.itemId = totalAuctions;
		_item.name = _name;
		_item.description = _description;
		_item.creator = payable(msg.sender);

		totalAuctions++;
		return _item.itemId;
	}

	/// @notice Places a bid on an open AuctionItem.
	/// @dev The itemId must be valid and the auction must not have been closed.
	/// @param _itemId The itemId of the item that the bid should be placed on.
	function placeBid(uint _itemId) public payable validItem(_itemId) isOpen(_itemId) hasValue() {
		AuctionItem storage _item = auctions[_itemId];

		uint i = 0;
		for (i; i < _item.numBids; i++) {
			if (_item.bids[i].bidder == msg.sender) {
				_item.bids[i].bid = _item.bids[i].bid + msg.value;
				break;
			}
		}

		if (i == _item.numBids) {
			_item.bids[_item.numBids++] = Bidder({ bidder: payable(msg.sender), bid: msg.value });
		}
	}

	/// @notice Closes an auction, returns the funds of the non-winners, and pays the creator.
	/// @dev The itemId must be valid and the auction must not have been closed.
	/// @param _itemId The itemId of the auction to be closed.
	function closeAuction(uint _itemId) public isCreator(auctions[_itemId].creator) validItem(_itemId) isOpen(_itemId) {
		AuctionItem storage _item = auctions[_itemId];

		// first find winner
		address tmpWinner;
		uint tmpWinningBid;
		for (uint i = 0; i < _item.numBids; i++) {
			if (_item.bids[i].bid > tmpWinningBid) {
				tmpWinner = _item.bids[i].bidder;
				tmpWinningBid = _item.bids[i].bid;
			}
		}

		// set winner
		_item.winner = tmpWinner;
		_item.winningBid = tmpWinningBid;

		for (uint i = 0; i < _item.numBids; i++) {
			address payable currentBidder = _item.bids[i].bidder;
			if (currentBidder == _item.winner) {
				// pay creator
				payable(msg.sender).transfer(_item.winningBid);
			} else {
				// refund losing bidder
				currentBidder.transfer(_item.bids[i].bid);
			}
		}
	}

	/// @notice Cancels an auction.
	/// @dev Only callable by the contract owner.
	/// @param _itemId The itemId of the auction to be canceled.
	function cancelAuction(uint _itemId) public onlyOwner validItem(_itemId) isOpen(_itemId) {
		AuctionItem storage _item = auctions[_itemId];

		// return all bids to bidders
		for (uint i = 0; i < _item.numBids; i++) {
			address payable currentBidder = _item.bids[i].bidder;
			currentBidder.transfer(_item.bids[i].bid);
		}

		_item.winner = owner();
	}

	/// @notice Get the number of bids for an item.
	/// @dev Currently only used for unit tests but no harm in providing it.
	/// @param _itemId The itemId of the auction to get the number of bids for.
	function getNumBids(uint _itemId) public view validItem(_itemId) returns (uint) {
		return auctions[_itemId].numBids;
	}

	/// @notice The receive fallback
	/// @dev Used to catch any payments not made using placeBid.
	receive() external payable {
		revert();
	}
}
