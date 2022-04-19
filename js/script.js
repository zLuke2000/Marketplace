var loadFile = function(event) {
    var image = document.getElementById('output');
    image.src = URL.createObjectURL(event.target.files[0]);
    let ratio = image.style.width / image.style.height; 
    image.style.height = "200px";
    image.style.width = ratio * height;
  };

async function loadWeb3() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    web3 = new Web3(window.ethereum);
    } catch (error) {
      console.error("User denied access", error);
    }
  } else {
    console.error("Metamask is required!")
  }
}

async function getCurrentAccount() {
  const accounts = await window.web3.eth.getAccounts();
  return accounts[0];
}

async function loadContract() {
  return await new window.web3.eth.Contract([
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address payable",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "purchased",
          "type": "bool"
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
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address payable",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "purchased",
          "type": "bool"
        }
      ],
      "name": "productPurchased",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
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
    }
  ], "0x0f64a4c92d48ae2397a921eCF000066557139778");
}

async function createProduct() {
  console.log("creating the new product...");
  let account = await getCurrentAccount();
  //calling the smart contract method
  window.contract.methods.createProduct("prova", 5).send({from: account})
  .on("receipt", (receipt) => console.log("Transaction completed here's the receipt:", receipt))
  .on("error", function(error, receipt) {
    console.error("An error occurred:\n" + error.message, error);
    if (receipt != null) {
      console.log("Transaction receipt:", receipt);
    }
  });
  //listen for the event
  contract.events.productCreated({
    fromBlock: 'latest'})
    .on("data", (event) => console.log(event))
    .on("error", (error) => {console.error("Something went wrong..." + error.message, error)});
}

async function load() {
  await loadWeb3();
  window.contract = await loadContract();
  console.log("contract loaded!");
  await createProduct();
}

load();