// SPDX-License-Identifier: MIT
pragma solidity >= 0.5.0;

contract Marketplace {

    event productCreated (
        string cid,
        address owner
    );

    event productPurchased(
        string cid, 
        address prevOwner,
        address newOwner,
        uint amount
    );

    function createProduct(string memory cid, address owner) public {
        emit productCreated(cid, owner);
    }

    function purchaseProduct (string memory cid, address payable owner) public payable {
        owner.transfer(msg.value);
        emit productPurchased(cid, owner, msg.sender, msg.value);
    }

}