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
    /// @notice InActive Error String
    string private constant CONTRACT_IN_ACTIVE = "Not Enough Items";
    /// @notice Invalid New Player - Already Has NFTs
    string private constant INVALID_NEW_PLAYER = "Already Playing";
    /// @notice Not an Item
    string private constant ITEM_DOES_NOT_EXIST = "Item Does Not Exist";
    /// @notice User Does Not Have Item
    string private constant USER_NO_ITEM = "Missing an item";

    /// @notice Unlock Date After Etherum CC is Over
    uint256 private unlockDate = 1658451660;

    event NewPlayer(address indexed newPlayer, uint256[3] indexed initialTokens, uint256 indexed timestamp);
    event Combined(address indexed creator, uint256 indexed tokenId, uint256 indexed timestamp);

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

    function combine(uint256 newItemId) override external {
        require(newItemId <= numberItems, ITEM_DOES_NOT_EXIST);
        GameItemMetadata storage item = metadata[newItemId];
        for (uint256 i = 0; i < item.combined.length; i++) {
            require(balanceOf(msg.sender, item.combined[i]) >= 1, USER_NO_ITEM);
        }
        _internalMint(msg.sender, newItemId);
        emit Combined(msg.sender, newItemId, block.timestamp);
    }

    function getOnChainToken(uint256 tokenId)  external view  returns (GameItemMetadata memory) { 
        return metadata[tokenId];
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

    function initialMint(address receiver) override external onlyMinter {
        require(numberItems == 12, CONTRACT_IN_ACTIVE);
        require(_noBalances(receiver), INVALID_NEW_PLAYER);
        uint256 _rng = _getRandomNumber();
        uint256[3] memory tokenIds = _rng == 0 ? [uint256(1), 3, 5] : [uint256(2), 4, 6];
        for (uint256 i = 0; i < 3; i++) {
            _internalMint(receiver, tokenIds[i]);
        }
        emit NewPlayer(receiver, tokenIds, block.timestamp);
    }

    /// @notice Checks if contract is locked
    /// @dev Internal/External
    /// @dev Returns True if Locked
    /// @return bool if is locked
    function isLocked() public view returns (bool) {
        return block.timestamp <= unlockDate;
    }

    function _internalMint(address receiver, uint256 tokenId) internal {
        _mint(receiver, tokenId, 1, "");
    }

    function supportsInterface(bytes4 interfaceId) public view override (AccessControlEnumerable, ERC1155, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _noBalances(address checkFor) internal view returns (bool) {
        for (uint256 i = 0; i < numberItems; i++) {
            if (balanceOf(checkFor, i) > 0) return false;
        }
        return true;
    }

    function _getRandomNumber() internal view returns (uint256) {
        return uint256(_randomNumberGenerator()) % 1000 < 500 ? 1 : 0;
    }

    function _randomNumberGenerator() internal view returns (bytes32 addr) {
        assembly {
            let freemem := mload(0x40)
            let start_addr := add(freemem, 0)
            if iszero(staticcall(gas(), 0x18, 0, 0, start_addr, 32)) {
              invalid()
            }
            addr := mload(freemem)
        }
    }
}