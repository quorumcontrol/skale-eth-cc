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

    function itemDetails(uint256 tokenID) external view returns (GameItemMetadata memory);
}
