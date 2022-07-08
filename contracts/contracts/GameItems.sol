// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC1155.sol";
// // import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";
// import "./interfaces/IGameItems.sol";

import "../node_modules/@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../node_modules/@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./interfaces/IGameItems.sol";

/**
*
* GameItems for ETH CC
*
* @author Tobower
* @author TheGreatAxios
**/
contract GameItems is AccessControlEnumerable, IGameItems {

    /// @notice Admin Role to Toggle Contract
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    /// @notice Can Fire Initial Mint
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @notice Can Mint on Wini
    bytes32 public constant WIN_MANAGER_ROLE = keccak256("WIN_MANAGER_ROLE");

    /// @notice Modifier Error String
    string private constant ACCESS_DENIED = "Access Denied";

    /// @notice Unlock Date After Etherum CC is Over
    uint256 private unlockDate = 1658451660;

    constructor() {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }


    modifier onlyAdmin {
        require(hasRole(ADMIN_ROLE, msg.sender), ACCESS_DENIED);
        _;
    }

    modifier onlyMinter {
        require(hasRole(MINTER_ROLE, msg.sender), ACCESS_DENIED);
        _;
    }

    modifier onlyWinManager {
        require(hasRole(WIN_MANAGER_ROLE, msg.sender), ACCESS_DENIED);
        _;
    }

    function craft(uint256 itemId, uint256 item2Id) external {}

    function getOnChainToken(uint256 tokenId) external pure returns (GameItemMetadata memory) {
        return GameItemMetadata('', '', '', '', new uint256[](2), new uint256[](2));
    }

    /// @notice Retreives Unlock Date 
    /// @dev Can be deprecated
    /// @return uint256 time in epoch * 1000
    function getUnlockDate() external view returns (uint256) {
        return unlockDate;
    }
    
    function initialMint(address receiver) external {}

    /// @notice Checks if contract is locked 
    /// @dev Internal/External
    /// @dev Returns True if Locked
    /// @return bool if is locked
    function isLocked() public view returns (bool) {
        return block.timestamp <= unlockDate;
    }

    
}

// contract GameItems is ERC1155, AccessControl, IGameItems {
//     bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

//     constructor(address initialOwner) ERC1155("EHCCContest") {
//         _setupRole(ADMIN_ROLE, initialOwner);
//     }

//     // function itemDetails(uint tokenID) public returns (GameItemMetadata memory) {
//     //   // return the metadata for the item
//     // };

//     /**
//      * @dev See {IERC165-supportsInterface}.
//      */
//     function supportsInterface(bytes4 interfaceId)
//         public
//         view
//         virtual
//         override(AccessControl, ERC1155)
//         returns (bool)
//     {
//         return super.supportsInterface(interfaceId);
//     }

// }