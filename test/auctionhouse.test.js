const AuctionHouse = artifacts.require('./AuctionHouse.sol');
let { catchRevert } = require('./exceptionsHelpers');

contract("AuctionHouse", function (accounts) {
  const [_owner, alice, bob, charlie] = accounts;

  let instance;
  beforeEach(async () => {
    instance = await AuctionHouse.new();
  });

  describe("Variables", () => {
    it("should have an owner", async () => {
      assert.equal(typeof instance.owner, 'function', "the contract has no owner");
    });

    it("should have a totalAuctions", async () => {
      assert.equal(typeof instance.totalAuctions, 'function', "the contract has no totalAuctions");
    });
  });

  describe("createAuction()", () => {
    it("should create an auction item", async () => {
      await instance.createAuction(
        "test auction",
        "this is a test auction",
        { from: alice }
      );
      assert.equal(await instance.totalAuctions(), 1);
    });

    it("can create multiple auction items", async () => {
      await instance.createAuction(
        "test auction",
        "this is a test auction",
        { from: alice }
      );
      await instance.createAuction(
        "different auction",
        "this is a different auction",
        { from: alice }
      );
      assert.equal(await instance.totalAuctions(), 2);
    });
  })

  describe("placeBid()", () => {
    beforeEach(async () => {
      await instance.createAuction(
        "test auction",
        "this is a test auction",
        { from: alice }
      );
    });

    it("should fail if no value", async () => {
      await catchRevert(instance.placeBid(0, { from: bob }));
    });

    it("should fail if item is invalid", async () => {
      await catchRevert(instance.placeBid(1, { from: bob }));
    });

    it("should accept bid", async () => {
      const bid = web3.utils.toBN(1);
      await instance.placeBid(0, { from: bob, value: bid });
      assert.equal(await instance.getNumBids(0), 1);
      assert.equal(await web3.eth.getBalance(instance.address), bid);
    });

    it("should accept multiple bids", async () => {
      const firstBid = web3.utils.toBN(1);
      const secondBid = web3.utils.toBN(2);
      await instance.placeBid(0, { from: bob, value: firstBid });
      await instance.placeBid(0, { from: charlie, value: secondBid });
      assert.equal(await instance.getNumBids(0), 2);
      assert.equal(await web3.eth.getBalance(instance.address), firstBid.toNumber() + secondBid.toNumber());
    });

    it("should fail if auction is closed", async () => {
      const bid = web3.utils.toBN(1);
      await instance.placeBid(0, { from: bob, value: bid });
      await instance.closeAuction(0, { from: alice });
      await catchRevert(instance.placeBid(0, { from: bob, value: bid }));
    });

  });

  describe("closeAuction()", () => {
    beforeEach(async () => {
      await instance.createAuction(
        "test auction",
        "this is a test auction",
        { from: alice }
      );
    });

    it("should fail if item is invalid", async () => {
      await catchRevert(instance.closeAuction(1, { from: alice }));
    });

    it("should fail if called by non-creator", async () => {
      await catchRevert(instance.closeAuction(0, { from: bob }));
    });

    it("should drain all money", async () => {
      const bid = web3.utils.toBN(1);
      await instance.placeBid(0, { from: bob, value: bid });
      await instance.placeBid(0, { from: charlie, value: bid });
      await instance.closeAuction(0, { from: alice });
      assert.equal(await web3.eth.getBalance(instance.address), 0);
    });
  });
});
