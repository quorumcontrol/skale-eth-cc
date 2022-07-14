// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface IGameItems is IERC1155 {
    struct GameItemMetadata {
        uint8 tier;
        string name;
        string description;
        string image;
        string animationUrl;
        uint256[] beats; // tokenIds of the tokens it beats
        uint256[] playoffs; // what items should a draw result in a coin flip?
    }

    function addItem(uint8 tier, string memory name, string memory description, string memory image, string memory animation, uint256[] memory beats, uint256[] memory playoffs, string memory tokenURI) external;
    function getOnChainToken(uint256 tokenId) external returns (GameItemMetadata memory);
    function getItems(address _address) external returns (GameItemMetadata[] memory);
    function getNumberItems() external returns (uint256);
    function getNumberPlayers() external returns (uint256);
    function getUnlockDate() external returns (uint256);
    function initialMint(address payable receiver) payable external;
    function isLocked() external returns (bool);
    function playoff() external returns (bool);
    function winBattle(address receiever, uint256 tokenId) external;
}
