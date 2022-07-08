// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGameItems {
    struct GameItemMetadata {
        string name;
        string description;
        string image;
        string animationUrl;
        uint256[] beats; // tokenIds of the tokens it beats
        uint256[] combined; // items which can be burnt together to create this item.
    }

    function craft(uint256 itemId, uint256 item2Id) external;
    function getOnChainToken(uint256 tokenId) external returns (GameItemMetadata memory);
    function getUnlockDate() external returns (uint256);
    function initialMint(address receiver) external;
    function isLocked() external returns (bool);
}
