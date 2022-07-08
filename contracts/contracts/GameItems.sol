// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IGameItems.sol";

contract GameItems is ERC1155, AccessControl, IGameItems {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    constructor(address initialOwner) ERC1155("EHCCContest") {
        _setupRole(ADMIN_ROLE, initialOwner);
    }

    function itemDetails(uint tokenID) public returns (GameItemMetadata memory) {
      // return the metadata for the item
    };

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC1155)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

}