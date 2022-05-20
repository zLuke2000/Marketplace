const contract_address = '0x5eC8c5B20aa4E1d06b319f6203A05f76DeEf6Dc5'
const contract_abi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "productCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "prevOwner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "productPurchased",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "createProduct",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "cid",
        "type": "string"
      },
      {
        "internalType": "address payable",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "purchaseProduct",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
]

async function loadWeb3() {
  if (window.ethereum) {
    try {
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      window.web3 = new Web3(window.ethereum)
      window.account = web3.utils.toChecksumAddress(accounts[0])
      console.log('Selected account is:', window.account)
    
      window.ethereum.on('accountsChanged', function(accounts) {
        window.account = web3.utils.toChecksumAddress(accounts[0])
        document.location.reload()
      })
    } catch (error) {
      console.error("User denied access", error);
    }
  } else {
    console.error("Metamask is required!")
    window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en')
    alert("Please install Metamaks")
  }
}

async function loadContract() {
  return await new window.web3.eth.Contract(contract_abi, contract_address);
}

export async function createProduct(cid, price) {
  console.log("creating the new product...")
  // calling the smart contract method
  contract.methods.createProduct(cid, window.account, price).send({from: window.account})
  .on("receipt", (receipt) => console.log("Transaction completed here's the receipt:", receipt))
  .on("error", function(error, receipt) {
    console.error("An error occurred:\n" + error.message, error)
    if (receipt != null) {
      console.log("Transaction receipt:", receipt)
    }
  })
}

export async function buyProduct() {
  
}

async function getAllProducts() {
  contract.getPastEvents("productCreated", { fromBlock: 0, toBlock: "latest"})
    .then( (events) => {
      for (let event of events) {
        console.log(event.returnValues);
      }
    });
}

async function load() {
  await loadWeb3()
  if (window.account != undefined) {
    window.contract = await loadContract()
  }
}

load();