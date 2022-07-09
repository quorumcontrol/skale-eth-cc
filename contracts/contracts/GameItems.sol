// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC1155.sol";
// // import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";
// import "./interfaces/IGameItems.sol";


import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./interfaces/IGameItems.sol";
import "hardhat/console.sol";
/**
*
* GameItems for ETH CC
*
* @author Tobower
* @author TheGreatAxios
*
* @dev This smart contract is an ERC-1155 standard contract
* @dev This contract is the core tokens for the mini-game
*
**/
contract GameItems is AccessControlEnumerable, ERC1155URIStorage, IGameItems {

    /// @notice Admin Role to Toggle Contract
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    /// @notice Can Fire Initial Mint
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    /// @notice Can Mint on Wini
    bytes32 public constant WIN_MANAGER_ROLE = keccak256("WIN_MANAGER_ROLE");

    /// @notice Number of Items on the contract
    uint256 private numberItems;
    /// @notice Number of Active Players
    uint256 private numberPlayers;
    /// @notice The storage of the shared items on-chain #SKALE
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
    
    /// @notice Emits a new item being added to the contract [token]
    /// @dev Used in the [addItem] function
    /// @param tokenId The [tokenId] that was created
    event NewItem(uint256 indexed tokenId);

    /// @notice Emits a new player being added to the contract [address]
    /// @dev Used in the [initialMint] function
    /// @dev All Tokens Minted will be equal to 1
    /// @param newPlayer The [newPlayer]that was added by address
    /// @param initialTokens The [initialTokens] that were added EXACT === 3
    /// @param timestamp The [timestamp] of the new player joining
    event NewPlayer(address indexed newPlayer, uint256[3] indexed initialTokens, uint256 indexed timestamp);

    /// @notice Emits a new item being added given to the player on successfull combination
    /// @dev Used in the [combine] function
    /// @param creator The [creator] that combined the NFTs
    /// @param tokenId The [tokenId] that was combined to make and minted for the [creator]
    /// @param timestamp The [timestamp] of combination occuring
    event Combined(address indexed creator, uint256 indexed tokenId, uint256 indexed timestamp);

    constructor() ERC1155("GameItems") {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        numberItems = 0;
        numberPlayers = 0;
    }

    /// @notice Only Admin -> Calls Add Item
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), ACCESS_DENIED);
        _;
    }

    /// @notice Only Minter -> Calls Initial Mint
    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, msg.sender), ACCESS_DENIED);
        _;
    }

    /// @notice Only Win Manager -> Call via Proxy
    modifier onlyWinManager() {
        require(hasRole(WIN_MANAGER_ROLE, msg.sender), ACCESS_DENIED);
        _;
    }
    /// @notice Admin Function that enables the admin owner to add new tokens to the contract storage
    /// @dev Creates Metadata -> Stores as New Index
    /// @dev Sets Token URI for Backward Compatability with Marketplaces
    /// @dev Updates Number Of Items
    /// @dev Emits [NewItem] event
    /// @param name description
    /// @param description description
    /// @param image description
    /// @param animation description
    /// @param beats description
    /// @param combined description
    /// @param tokenURI description

    function addItem(string memory name, string memory description, string memory image, string memory animation, uint256[] memory beats, uint256[] memory combined, string memory tokenURI) override external onlyAdmin {
        GameItemMetadata memory newItem = GameItemMetadata(name, description, image, animation, beats, combined);
        uint256 _currentItemIndex = numberItems;
        metadata[_currentItemIndex] = newItem;
        _setURI(_currentItemIndex, tokenURI);
        numberItems++;
        emit NewItem(_currentItemIndex);
    }

    /// @notice Function takes a tokenId and checks if the signer has the required building blocks
    /// @dev Uses the Storage Metadata for the checks to be fair across the board
    /// @dev Balance Must be Greater than Or Equal to One
    /// @dev Emits [Combined] Event if Combined
    /// @param newItemId tokenId the signer is attempting to create
    function combine(uint256 newItemId) override external {
        require(newItemId <= numberItems, ITEM_DOES_NOT_EXIST);
        GameItemMetadata storage item = metadata[newItemId];
        for (uint256 i = 0; i < item.combined.length; i++) {
            require(balanceOf(msg.sender, item.combined[i]) >= 1, USER_NO_ITEM);
        }
        _internalMint(msg.sender, newItemId);
        emit Combined(msg.sender, newItemId, block.timestamp);
    }

    /// @notice Returns on Chain Token - Single (Metadata)
    function getOnChainToken(uint256 tokenId)  external view  returns (GameItemMetadata memory) { 
        return metadata[tokenId];
    }

    /// @notice Loads all the Metadata by a player in order to allow them to load the data
    /// @dev Thoughts on making this a signed request during ETH CC?
    function getItems(address _address) override external view returns (GameItemMetadata[] memory) {
        GameItemMetadata[] memory _items = new GameItemMetadata[](numberItems);
        for (uint256 i = 0; i < _items.length; i++) {
            if (balanceOf(_address, i) <= 1) {
                _items[i] = metadata[i];
            }
        }

        return _items;
    }

    /// @notice Retreives the current number of players/holders
    function getNumberPlayers() override external view returns (uint256) {
        return numberPlayers;
    }

    /// @notice Retreives Unlock Date
    /// @dev Can be deprecated
    /// @return uint256 time in epoch * 1000
    function getUnlockDate() external view returns (uint256) {
        return unlockDate;
    }

    function initialMint(address receiver) override external onlyMinter {
        //// TESTING VALUE === 6
        require(numberItems == 6, CONTRACT_IN_ACTIVE); /// PRODUCTION VALUE === require(numberItems == 12, CONTRACT_IN_ACTIVE);
        require(_noBalances(receiver), INVALID_NEW_PLAYER);
        uint256 _rng = _getRandomNumber();
        uint256[3] memory tokenIds = _rng == 0 ? [uint256(0), 2, 4] : [uint256(1), 3, 5];
        for (uint256 i = 0; i < 3; i++) {
            _internalMint(receiver, tokenIds[i]);
        }
        numberPlayers++;
        emit NewPlayer(receiver, tokenIds, block.timestamp);
    }

    /// @notice Checks if contract is locked
    /// @dev Internal/External
    /// @dev Returns True if Locked
    /// @return bool if is locked
    function isLocked() public view returns (bool) {
        return block.timestamp <= unlockDate;
    }

    /// @notice Required for Inheriting Contracts
    function supportsInterface(bytes4 interfaceId) public view override (AccessControlEnumerable, ERC1155, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /// @notice Internal Mint
    /// @dev Mints the Selected Token Id to the Selected Reciever
    /// @dev Always mints only 1
    /// @param receiver address of the person who the token will go to
    /// @param tokenId The Specific token they should receive
    function _internalMint(address receiver, uint256 tokenId) internal {
        _mint(receiver, tokenId, 1, "");
    }

    /// @notice Checks If a Player being added has toknes
    /// @dev Will Return True -> Allowing New Player to Be Created
    /// @dev If Player has any token, will not allow them to be added again
    /// @param checkFor address to check
    function _noBalances(address checkFor) internal view returns (bool) {
        for (uint256 i = 0; i < numberItems; i++) {
            if (balanceOf(checkFor, i) > 0) return false;
        }
        return true;
    }

    /// @notice SKALE RNG Casting
    function _getRandomNumber() internal view returns (uint256) {
        return uint256(_randomNumberGenerator()) % 1000 < 500 ? 1 : 0;
    }

    /// @notice SKALE RNG (CHECK!)
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