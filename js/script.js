var loadFile = function(event) {
    var image = document.getElementById('output');
    image.src = URL.createObjectURL(event.target.files[0]);
    let ratio = image.style.width / image.style.height; 
    image.style.height = "200px";
    image.style.width = ratio * height;
  };

function timestamp() {
  let date = new Date()
  console.log(date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ':' + date.getMilliseconds())
}

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
  // calling the smart contract method
  window.contract.methods.createProduct(productName, productPrice).send({from: account})
  .on("receipt", (receipt) => console.log("Transaction completed here's the receipt:", receipt))
  .on("error", function(error, receipt) {
    console.error("An error occurred:\n" + error.message, error);
    if (receipt != null) {
      console.log("Transaction receipt:", receipt);
    }
  });
  // listen for the event
  contract.events.productCreated({
    fromBlock: 'latest'})
    .on("data", (event) => console.log(event))
    .on("error", (error) => {console.error("Something went wrong..." + error.message, error)});
}

async function addToIPFS(data) {
  //attesa circa 10s
  const node = await IpfsCore.create()
  let results = await node.add(data)
  console.log(results.path)
}

async function load() {
  await loadWeb3();
  window.contract = await loadContract();
  console.log("contract loaded!");
  // addToIPFS('prova')
}

load();

function showError(input, message) {
  // get the form-field element
  let formField = input.parentElement;
  // add the error class
  formField.classList.remove('success');
  formField.classList.add('error');

  // show the error message
  let error = formField.querySelector('small');
  error.textContent = message;
}

function removeError(input) {
  let formField = input.parentElement;
  formField.classList.remove('error');
  let error = formField.querySelector('small');
  error.textContent = '';
}

function checkProductName() {
  let productNameEl = document.querySelector("#inputProductName");
  if (productNameEl.value.trim() === "") {
    console.error("Name is blank");
    showError(productNameEl, "Product name cannot be blank!");
    return false;
  } else {
    console.log("Product name is ok!")
    removeError(productNameEl)
    return true;
  }
}

function checkProductPrice() {
  let productPriceEl = document.querySelector("#inputProductPrice");
  const re = /\d/; 
  let price = productPriceEl.valueAsNumber;
  if (!re.test(price)) {
    console.error("Product price is not valid!");
    showError(productPriceEl, "Product price must contain only digits!");
    return false;
  } else {
    console.log("Price is ok!");
    removeError(productPriceEl)
    return true;
  }
}

document.querySelector("#btn_createProduct").addEventListener("click", function validate(e) {
  let isProductNameValid = checkProductName(),
    isProductPriceValid = checkProductPrice();

    if (isProductNameValid && isProductPriceValid) {
      console.log("All inputs are valid!");
      console.log("Going to create a product");
      // createProduct();
    }
  
});

async function getAllProducts() {
  contract.getPastEvents("productCreated", { fromBlock: 0, toBlock: "latest"})
    .then( (events) => {
      for (let event of events) {
        console.log(event.returnValues);
      }
    });
}