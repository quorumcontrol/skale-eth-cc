// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC1155.sol";
// // import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";
// import "./interfaces/IGameItems.sol";


import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./interfaces/IGameItems.sol";

/**
*
* GameItems for ETH CC
*
* @author Tobower
* @author TheGreatAxios
**/
contract GameItems is AccessControlEnumerable, ERC1155URIStorage, IGameItems {
    /// @notice Admin Role to Toggle Contract
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    /// @notice Can Fire Initial Mint
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @notice Can Mint on Wini
    bytes32 public constant WIN_MANAGER_ROLE = keccak256("WIN_MANAGER_ROLE");

    GameItemMetadata private DEFAULT_ITEM = GameItemMetadata("Defualt", "Eth CC Metadata", "", "", new uint256[](0), new uint256[](0));

    uint256 private numberItems;
    mapping(uint256 => GameItemMetadata) private metadata;

    /// @notice Modifier Error String
    string private constant ACCESS_DENIED = "Access Denied";

    /// @notice Unlock Date After Etherum CC is Over
    uint256 private unlockDate = 1658451660;

    constructor() ERC1155("GameItems") {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        numberItems = 0;
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), ACCESS_DENIED);
        _;
    }

    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, msg.sender), ACCESS_DENIED);
        _;
    }

    modifier onlyWinManager() {
        require(hasRole(WIN_MANAGER_ROLE, msg.sender), ACCESS_DENIED);
        _;
    }

    function addItem(string memory name, string memory description, string memory image, string memory animation, uint256[] memory beats, uint256[] memory combined, string memory tokenURI) override external onlyAdmin {
        GameItemMetadata memory newItem = GameItemMetadata(name, description, image, animation, beats, combined);
        metadata[numberItems] = newItem;
        _setURI(numberItems, tokenURI);
        numberItems = numberItems + 1;
    }

    function craft(uint256 itemId, uint256 item2Id) external {}

    function getOnChainToken(uint256 tokenId)  external  pure  returns (GameItemMetadata memory) { 
        return GameItemMetadata(
                "",
                "",
                "",
                "",
                new uint256[](2),
                new uint256[](2)
            );
    }

    function getItems(address _address) override external view returns (GameItemMetadata[] memory) {
        GameItemMetadata[] memory _items = new GameItemMetadata[](numberItems);
        for (uint256 i = 0; i < _items.length; i++) {
            if (balanceOf(_address, i) <= 1) {
                _items[i] = metadata[i];
            }
        }

        return _items;
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

    function _internalMint() external {}

    function supportsInterface(bytes4 interfaceId) public view override (AccessControlEnumerable, ERC1155, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}