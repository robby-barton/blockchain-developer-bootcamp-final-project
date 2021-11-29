const contractAddress = '0xF7F4397F4A637b001361344736015fAd438ECc57';
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "auctions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "itemId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "numBids",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "winningBid",
        "type": "uint256"
      },
      {
        "internalType": "address payable",
        "name": "creator",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalAuctions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      }
    ],
    "name": "createAuction",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_itemId",
        "type": "uint256"
      }
    ],
    "name": "placeBid",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_itemId",
        "type": "uint256"
      }
    ],
    "name": "closeAuction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_itemId",
        "type": "uint256"
      }
    ],
    "name": "cancelAuction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_itemId",
        "type": "uint256"
      }
    ],
    "name": "getNumBids",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
]

function createListing(auctionItem, auctionDiv) {
  var web3 = new Web3(window.ethereum);
  const auctionHouse = new web3.eth.Contract(contractABI, contractAddress);
  auctionHouse.setProvider(window.ethereum);

  const itemDiv = document.createElement('div');
  itemDiv.style.marginBottom = '20px';

  const header = document.createElement('div');
  header.innerHTML = auctionItem.name.bold();
  itemDiv.appendChild(header);

  const desc = document.createElement('div');
  desc.innerHTML = auctionItem.description;
  itemDiv.appendChild(desc);

  const creator = document.createElement('div');
  creator.innerHTML = "Creator: " + auctionItem.creator;
  itemDiv.appendChild(creator);

  const bids = document.createElement('div');
  bids.innerHTML = "Current Bids: " + auctionItem.numBids;
  itemDiv.appendChild(bids);

  const bidDiv = document.createElement('div');

  const bidPrice = document.createElement('input');
  bidPrice.setAttribute('type', 'number');
  bidPrice.setAttribute('placeholder', 'Bid');
  bidDiv.appendChild(bidPrice);

  const placeBid = document.createElement('button');
  placeBid.innerHTML = "Place Bid";
  placeBid.onclick = async () => {
    await auctionHouse.methods.placeBid(auctionItem.itemId).send({
      from: ethereum.selectedAddress,
      value: web3.utils.toWei(bidPrice.value, 'ether')
    }, async function (error, txHash) {
      if (!error) {
        txStatus.innerHTML = 'Transaction sent!';
        let txReceipt = null;
        while (txReceipt == null) {
          await sleep(1000);
          txReceipt = await web3.eth.getTransactionReceipt(txHash);
        }
        if (txReceipt.status == '0x0') {
          txStatus.innerHTML = 'Contract call failed!';
        } else {
          txStatus.innerHTML = 'Contract call succeeded!';
        }
      } else {
        txStatus.innerHTML = 'Transaction failed to send!';
      }
      populateAuctionListings();
    });
  }
  bidDiv.appendChild(placeBid);
  itemDiv.appendChild(bidDiv);

  if (ethereum.selectedAddress.toLowerCase() === auctionItem.creator.toLowerCase()) {
    const closeAuction = document.createElement('button');
    closeAuction.innerHTML = "Close Auction";
    closeAuction.onclick = async () => {
      await auctionHouse.methods.closeAuction(auctionItem.itemId).send({
        from: ethereum.selectedAddress},
        async function (error, txHash) {
          if (!error) {
            txStatus.innerHTML = 'Transaction sent!';
            let txReceipt = null;
            while (txReceipt == null) {
              await sleep(1000);
              txReceipt = await web3.eth.getTransactionReceipt(txHash);
            }
            if (txReceipt.status == '0x0') {
              txStatus.innerHTML = 'Contract call failed!';
            } else {
              txStatus.innerHTML = 'Contract call succeeded!';
            }
          } else {
            txStatus.innerHTML = 'Transaction failed to send!';
          }
          populateAuctionListings();
        });
    }
    itemDiv.appendChild(closeAuction);
  }

  auctionDiv.appendChild(itemDiv);
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

var populateAuctionListings = async () => {
  const auctionListings = document.getElementById('auction-items');
  // clear earlier stuff
  auctionListings.innerHTML = '';

  var web3 = new Web3(window.ethereum);
  const auctionHouse = new web3.eth.Contract(contractABI, contractAddress);
  auctionHouse.setProvider(window.ethereum);

  const numAuctions = await auctionHouse.methods.totalAuctions().call();
  console.log(numAuctions);
  for (let i = 0; i < numAuctions; i++) {
    const auction = await auctionHouse.methods.auctions(i).call();
    console.log(auction);
    if (auction.winningBid == 0) {
      createListing(auction, auctionListings);
    }
  }
}

const mmEnable = document.getElementById('mm-connect');
const mmCurrentAccount = document.getElementById('mm-current-account');
const txStatus = document.getElementById('tx-status');
// detect MetaMask
window.onload = function () {
  if (typeof window.ethereum !== 'undefined') {
    if (ethereum.selectedAddress !== null) {
      mmCurrentAccount.innerHTML = "Connected: " + ethereum.selectedAddress;
      mmEnable.disabled = true;
    } else {
      mmCurrentAccount.innerHTML = "Not connected";
    }
  } else {
    mmCurrentAccount.innerHTML = "No wallet installed";
  }

  populateAuctionListings();
};

// get access to MetaMask
mmEnable.onclick = async () => {
  await ethereum.request({ method: 'eth_requestAccounts' })
  mmCurrentAccount.innerHTML = "Connected: " + ethereum.selectedAddress;
  populateAuctionListings();
  mmEnable.disabled = true;
}

const auctionCreate = document.getElementById('auction-create');
auctionCreate.onclick = async () => {
  const auctionName = document.getElementById('auction-name').value;
  const auctionDesc = document.getElementById('auction-desc').value;

  var web3 = new Web3(window.ethereum);
  const auctionHouse = new web3.eth.Contract(contractABI, contractAddress);
  auctionHouse.setProvider(window.ethereum);

  await auctionHouse.methods.createAuction(auctionName, auctionDesc).send({from: ethereum.selectedAddress},
    async function (error, txHash) {
      if (!error) {
        txStatus.innerHTML = 'Transaction sent!';
        let txReceipt = null;
        while (txReceipt == null) {
          await sleep(1000);
          txReceipt = await web3.eth.getTransactionReceipt(txHash);
        }
        if (txReceipt.status == '0x0') {
          txStatus.innerHTML = 'Contract call failed!';
        } else {
          txStatus.innerHTML = 'Contract call succeeded!';
        }
      } else {
        txStatus.innerHTML = 'Transaction failed to send!';
      }
      populateAuctionListings();
    });
}
