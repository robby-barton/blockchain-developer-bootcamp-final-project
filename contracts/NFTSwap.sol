// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

// @title Contract for Swaping NFTs
// @author Robby Barton
contract NFTSwap is IERC721Receiver {
	address public owner = msg.sender;

	uint public tradeCount;
	mapping (uint => NFTTrade) public trades;

	// state of a trade
	enum State {
		Open,
		Done,
		Canceled
	}

	// information required to be able to send an NFT
	struct NFT {
		address contractAddress;
		uint tokenId;
	}

	// representation of a trade:
	// NFToffered - the NFT being offered by the trade creator
	// NFTdesired - the desired NFT of the trade creator
	// tradeState - state of the trade
	// creator - address of the trade creator
	// tradeNum - the number used for the mapping
	// valid - used to check if trade exists
	struct NFTTrade {
		NFT NFToffered;
		NFT NFTdesired;
		State tradeState;
		address creator;
		uint tradeNum;
		bool valid;
	}

	// events
	event LogTradeCreated(uint tradeNum);
	event LogTradeCompleted(uint tradeNum);
	event LogTradeCanceled(uint tradeNum);

	modifier isCreator(address _address) {
		require(msg.sender == _address);
		_;
	}

	modifier isOpen(uint _tradeNum) {
		require(trades[_tradeNum].valid == true);
		_;
	}

	modifier isApproved(address _tokenAddr, uint _tokenId) {
		require(IERC721(_tokenAddr).getApproved(_tokenId) == address(this));
		_;
	}

	modifier ownsNFT(address _tokenAddr, uint _tokenId) {
		require(IERC721(_tokenAddr).ownerOf(_tokenId) == msg.sender);
		_;
	}

	constructor() {}

	// @name createTrade
	// @param _offeredTokenAddr Token Address for the offered NFT
	// @param _offeredTokenId TokenId for the offered NFT
	// @param _desiredTokenAddr Token Address for the desired NFT
	// @param _desiredTokenId TokenId for the desired NFT
	// @return bool True when trade is created
	function createTrade(
		address _offeredTokenAddr,
		uint _offeredTokenId,
		address _desiredTokenAddr,
		uint _desiredTokenId
	) public ownsNFT(
		_offeredTokenAddr,
		_offeredTokenId
	) isApproved(
		_offeredTokenAddr,
		_offeredTokenId
	) returns (bool) {
		// offered NFT
		NFT memory _offered = NFT({
			contractAddress: _offeredTokenAddr,
			tokenId: _offeredTokenId
		});
		// desired NFT
		NFT memory _desired = NFT({
			contractAddress: _desiredTokenAddr,
			tokenId: _desiredTokenId
		});

		NFTTrade memory newTrade = NFTTrade({
			NFToffered: _offered,
			NFTdesired: _desired,
			tradeState: State.Open,
			creator: msg.sender,
			tradeNum: tradeCount,
			valid: true
		});

		trades[tradeCount] = newTrade;
		tradeCount = tradeCount + 1;

		// give NFT to contract
		IERC721(_offeredTokenAddr).safeTransferFrom(msg.sender, address(this), _offeredTokenId);

		emit LogTradeCreated(newTrade.tradeNum);
		return true;
	}

	// @name canceltrade
	// @param _tradeNum TradeNum from the NFTTrade object to cancel
	// @return bool True when the trade is canceled
	function cancelTrade(
		uint _tradeNum
	) public isCreator(trades[_tradeNum].creator) isOpen(_tradeNum) returns (bool) {
		NFTTrade storage _trade = trades[_tradeNum];
		NFT memory sendBack = _trade.NFToffered;

		IERC721(sendBack.contractAddress).safeTransferFrom(
			address(this),
			_trade.creator,
			sendBack.tokenId
		);
		_trade.tradeState = State.Canceled;
		emit LogTradeCanceled(_tradeNum);
		return true;
	}

	// @name completeTrade
	// @param _tradeNum TradeNum from the NFTTrade object to complete
	// @return bool True when trade completes
	function completeTrade(
		uint _tradeNum
	) public isOpen(_tradeNum) ownsNFT(
		trades[_tradeNum].NFTdesired.contractAddress,
		trades[_tradeNum].NFTdesired.tokenId
	) isApproved(
		trades[_tradeNum].NFTdesired.contractAddress,
		trades[_tradeNum].NFTdesired.tokenId
	)returns (bool){
		NFTTrade storage _trade = trades[_tradeNum];
		NFT memory _offered = _trade.NFToffered;
		NFT memory _desired = _trade.NFTdesired;

		IERC721(_desired.contractAddress).safeTransferFrom(
			msg.sender,
			_trade.creator,
			_desired.tokenId
		);

		IERC721(_offered.contractAddress).safeTransferFrom(
			address(this),
			msg.sender,
			_offered.tokenId
		);

		_trade.tradeState = State.Done;
		emit LogTradeCompleted(_tradeNum);
		return true;
	}

	// required for contract to receive an ERC721
	function onERC721Received(
		address,
		address,
		uint256,
		bytes calldata
	) public pure override returns (bytes4) {
		return this.onERC721Received.selector;
	}

	// fallback that reverts when any transaction either sends ether or has empty data
	receive() external payable {
		revert();
	}
}
