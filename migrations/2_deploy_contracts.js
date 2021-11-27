var NFTSwap = artifacts.require("./NFTSwap.sol");

module.exports = function(deployer) {
  deployer.deploy(NFTSwap);
};
