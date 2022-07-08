// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IGameItems.sol";

contract Battle {

  IGameItems immutable gameItemContract;

  // this is used to hold the commit/reveal
  struct PlayedItem {
    bytes32 commitment;
    bytes32 salt;
    uint itemPlayed; // this is the reveal
    address opponent;
  }

  // this 
  mapping(address => mapping(uint => PlayedItem)) public rounds;

  constructor(address gameItemAddress) {
    gameItemContract = IGameItems(gameItemAddress);
  }

  function battle() public {
    // 
  }

}