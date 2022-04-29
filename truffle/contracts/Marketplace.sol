// SPDX-License-Identifier: MIT
pragma solidity > 0.5.0;
//TODO: compatibilità con ipfs
contract Marketplace {

    mapping (bytes32 => Product) products;

    // struct Product {
        // bytes32 id;
        // string name;
        // uint price;
        // address payable owner;
        // bool purchased;
    //     string _hash;
    // }

    struct Product {
        string cid;
        
    }

    // event productCreated (
    //     bytes32 id,
    //     string name, 
    //     uint price,
    //     address payable owner,
    //     bool purchased
    // );

    event productCreated (
        string cid
    );

    event productPurchased(
        bytes32 id,
        string name,
        address payable owner,
        bool purchased
    );

    // function createProduct(string memory name, uint price) public {

    //     require(bytes(name).length > 0, "Nome inserito non valido");
    //     require(price > 0, "Prezzo inserito non valido");

    //     bytes32 id = keccak256(abi.encode(msg.sender, block.timestamp));

    //     products[id] = Product(id, name, price, payable(msg.sender), false);

    //     emit productCreated(id, name, price, payable(msg.sender), false);
    // }

    function createProduct(string memory cid) public {
        
        bytes32 id = keccak256(abi.encode(cid));
        products[id] = Product(cid);
        emit productCreated(cid);
    }

}