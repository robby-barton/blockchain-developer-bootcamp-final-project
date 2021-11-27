let BN = web3.utils.BN;
const NFTSwap = artifacts.require('./NFTSwap.sol');
const TestNFT = artifacts.require('./TestNFT.sol');
let { catchRevert } = require('./exceptionsHelpers');

contract("NFTSwap", function (accounts) {
  const [_owner, alice, bob] = accounts;
  let instance;
  let nftInstance;
  let offeredId = 1;
  let desiredId = 2;
  let nftAddress;

  beforeEach(async () => {
    instance = await NFTSwap.new();
    nftInstance = await TestNFT.new();
    nftAddress = nftInstance.address;
    await nftInstance.mintNFT(alice, { from: _owner });
    await nftInstance.mintNFT(bob, { from: _owner });
  });

  describe("Variables", () => {
    it("should have an owner", async () => {
      assert.equal(typeof instance.owner, 'function', "the contract has no owner");
    });

    it("should have a tradeCount", async () => {
      assert.equal(typeof instance.tradeCount, 'function', "the contract has no tradeCount");
    });

    describe("enum State", () => {
      let enumState;
      before(() => {
        enumState = NFTSwap.enums.State;
        assert(
          enumState,
          "the contract should define an enum called State"
        );
      });

      it("should define `Open`", () => {
        assert(
          enumState.hasOwnProperty('Open'),
          "the enum has no `Open` value"
        );
      });

      it("should define `Done`", () => {
        assert(
          enumState.hasOwnProperty('Done'),
          "the enum has no `Done` value"
        );
      });

      it("should define `Canceled`", () => {
        assert(
          enumState.hasOwnProperty('Canceled'),
          "the enum has no `Canceled` value"
        );
      });
    });
  });

  describe("createTrade()", () => {
    it("should revert if contract is not approved by owner", async () => {
      await catchRevert(instance.createTrade(
        nftAddress,
        offeredId,
        nftAddress,
        desiredId,
        { from: alice }
      ));
    });

    it("should add NFT to contract", async () => {
      // pre-test, ensures test NFTs still work
      let nftOwner = await nftInstance.ownerOf(offeredId);
      assert.equal(nftOwner, alice);
      assert.equal(await nftInstance.balanceOf(instance.address), 0);

      await nftInstance.approve(instance.address, 1, { from: alice });

      await instance.createTrade(
        nftAddress,
        offeredId,
        nftAddress,
        desiredId,
        { from: alice }
      );

      assert.equal(await instance.tradeCount(), 1);
      let newOwner = await nftInstance.ownerOf(offeredId);
      assert.equal(newOwner, instance.address);
      assert.equal(await nftInstance.balanceOf(instance.address), 1);
      assert.equal(await nftInstance.balanceOf(alice), 0);
    });
  });

  describe("cancelTrade()", () => {
    beforeEach(async () => {
      await nftInstance.approve(instance.address, 1, { from: alice });
      await instance.createTrade(
        nftAddress,
        offeredId,
        nftAddress,
        desiredId,
        { from: alice }
      );
    });

    it("should revert if called by non-creator", async () => {
      await catchRevert(instance.cancelTrade(0, { from: bob }));
    });

    it("should revert if trade already canceled", async () => {
      await instance.cancelTrade(0, { from: alice });

      await catchRevert(instance.cancelTrade(0, { from: alice }));
    });

    it("should return NFT when canceled", async () => {
      let nftOwner = await nftInstance.ownerOf(offeredId);
      assert.equal(nftOwner, instance.address);

      await instance.cancelTrade(0, { from: alice });

      let newOwner = await nftInstance.ownerOf(offeredId);
      assert.equal(newOwner, alice);
    });
  });

  describe("completeTrade()", () => {
    beforeEach(async () => {
      await nftInstance.approve(instance.address, 1, { from: alice });
      await instance.createTrade(
        nftAddress,
        offeredId,
        nftAddress,
        desiredId,
        { from: alice }
      );
    });

    it("should revert if contract is not approved by owner", async () => {
      await catchRevert(instance.completeTrade(0, { from: bob }));
    });

    it("should revert if trade is canceled", async () => {
      await instance.cancelTrade(0, { from: alice });

      await nftInstance.approve(instance.address, 2, { from: bob });
      await catchRevert(instance.completeTrade(0, { from: bob }));
    });

    it("should swap NFTs", async () => {
      await nftInstance.approve(instance.address, 2, { from: bob });
      await instance.completeTrade(0, { from: bob });

      // check that alice and bob have 1 NFT and the contract has none
      assert.equal(await nftInstance.balanceOf(instance.address), 0);
      assert.equal(await nftInstance.balanceOf(alice), 1);
      assert.equal(await nftInstance.balanceOf(bob), 1);

      // bob should have NFT 1 now
      let offeredOwner = await nftInstance.ownerOf(offeredId);
      assert.equal(offeredOwner, bob);

      // alice shouldhave NFT 2 now
      let desiredOwner = await nftInstance.ownerOf(desiredId);
      assert.equal(desiredOwner, alice);
    });
  });
});
