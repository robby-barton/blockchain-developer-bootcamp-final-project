// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

// @title Auction House
// @author Robby Barton
contract AuctionHouse {
	address public owner = msg.sender;

	uint public totalAuctions;
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

	// events
	constructor() {}

	function createAuction(string memory _name, string memory _description) public returns (uint) {
		AuctionItem storage _item = auctions[totalAuctions];
		_item.itemId = totalAuctions;
		_item.name = _name;
		_item.description = _description;
		_item.creator = payable(msg.sender);

		totalAuctions++;
		return _item.itemId;
	}

	function placeBid(uint _itemId) public payable validItem(_itemId) isOpen(_itemId) hasValue() {
		AuctionItem storage _item = auctions[_itemId];

		_item.bids[_item.numBids++] = Bidder({ bidder: payable(msg.sender), bid: msg.value });
	}

	function getNumBids(uint _itemId) public view validItem(_itemId) returns (uint) {
		return auctions[_itemId].numBids;
	}

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

	// fallback that reverts when any transaction either sends ether or has empty data
	receive() external payable {
		revert();
	}
}
