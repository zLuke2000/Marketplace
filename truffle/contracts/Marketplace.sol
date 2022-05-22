// SPDX-License-Identifier: MIT
pragma solidity >= 0.5.0;

contract Marketplace {

    event productCreated (
        string cid,
        address owner,
        uint price
    );

    event productPurchased(
        string cid, 
        address prevOwner,
        address newOwner,
        uint price
    );

    function createProduct(string memory cid, uint price) public {
        emit productCreated(cid, msg.sender, price);
    }

    function purchaseProduct(string memory cid, address payable owner) public payable {
        owner.transfer(msg.value);
        emit productPurchased(cid, owner, msg.sender, msg.value / 1 ether);
    }
}