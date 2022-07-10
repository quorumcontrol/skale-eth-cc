// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface IGameItems is IERC1155 {
    struct GameItemMetadata {
        string name;
        string description;
        string image;
        string animationUrl;
        uint256[] beats; // tokenIds of the tokens it beats
        uint256[] combined; // items which can be burnt together to create this item.
    }

    function addItem(string memory name, string memory description, string memory image, string memory animation, uint256[] memory beats, uint256[] memory combined, string memory tokenURI) external;
    function combine(uint256 newItemId) external;
    function getOnChainToken(uint256 tokenId) external returns (GameItemMetadata memory);
    function getItems(address _address) external returns (GameItemMetadata[] memory);
    function getNumberItems() external returns (uint256);
    function getNumberPlayers() external returns (uint256);
    function getUnlockDate() external returns (uint256);
    function initialMint(address receiver) external;
    function isLocked() external returns (bool);
}
