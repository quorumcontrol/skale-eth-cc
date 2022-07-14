// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./interfaces/IGameItems.sol";
import "./interfaces/IDiceRoller.sol";

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

    /// @notice the contract that provides random numbers
    IDiceRoller immutable diceRoller;

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
    // @param timestamp The [timestamp] of the new player joining
    event NewPlayer(address indexed newPlayer, uint256[] indexed initialTokens);

    /// @notice Emits a new item being added given to the player on successfull combination
    /// @dev Used in the [combine] function
    /// @param creator The [creator] that combined the NFTs
    /// @param tokenId The [tokenId] that was combined to make and minted for the [creator]
    /// @param timestamp The [timestamp] of combination occuring
    event Combined(address indexed creator, uint256 indexed tokenId, uint256 indexed timestamp);

    /// @notice Emits a TierUnlocked allowing for the frontend to notify the player
    /// @dev Used inside the [winBattle] function
    /// @param player The [player] who is unlocked a new tier
    /// @param tokenId The [tokenId] that was granted for this new tier
    /// @param tier The [tier] that was unlocked
    event TierUnlocked(address indexed player, uint256 indexed tokenId, uint8 indexed tier);

    constructor(address diceRollerContract) ERC1155("GameItems") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        diceRoller = IDiceRoller(diceRollerContract);
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

    /// @notice Additional Modifier to Allow Shared Access
    modifier onlyViewNumberItems() {
        require(hasRole(WIN_MANAGER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender), ACCESS_DENIED);
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
    /// @param playoffs description
    /// @param tokenURI description
    function addItem(uint8 tier, string memory name, string memory description, string memory image, string memory animation, uint256[] memory beats, uint256[] memory playoffs, string memory tokenURI) override external onlyAdmin {
        uint256 _currentItemIndex = numberItems;
        GameItemMetadata memory newItem = GameItemMetadata(tier, name, description, image, animation, beats, playoffs);
        metadata[_currentItemIndex] = newItem;
        _setURI(_currentItemIndex, tokenURI);
        numberItems++;
        emit NewItem(_currentItemIndex);
    }

    /// @notice Returns on Chain Token - Single (Metadata)
    /// @param tokenId of the token to retreive
    /// @return GameItemMetadata of the Item
    function getOnChainToken(uint256 tokenId)  external view  returns (GameItemMetadata memory) { 
        return metadata[tokenId];
    }

    /// @notice Loads all the Metadata by a player in order to allow them to load the data
    /// @dev Thoughts on making this a signed request during ETH CC?
    /// @param _address of the user
    /// @return GameItemMetadata[] the items of the player
    function getItems(address _address) override external view returns (GameItemMetadata[] memory) {
        GameItemMetadata[] memory _items = new GameItemMetadata[](numberItems);
        for (uint256 i = 0; i < _items.length; i++) {
            if (balanceOf(_address, i) >= 1) {
                _items[i] = metadata[i];
            }
        }

        return _items;
    }

    /// @notice Retreives the current number of players/holders
    function getNumberPlayers() override external view returns (uint256) {
        return numberPlayers;
    }

    function getNumberItems() external view onlyViewNumberItems returns (uint256) {
        return numberItems;
    }

    /// @notice Retreives Unlock Date
    /// @dev Can be deprecated
    /// @return uint256 time in epoch * 1000
    function getUnlockDate() external view returns (uint256) {
        return unlockDate;
    }

    /// @dev Initial Mint Function
    /// @dev Only Callalble by MINTER_ROLE
    /// @dev Emits [NewPlayer] event and adds a new player
    /// @param receiver the individual receiving the intial mint
    function initialMint(address payable receiver) override external payable onlyMinter {
        require(_noBalances(receiver), INVALID_NEW_PLAYER);
        
        uint256[] memory tokenIds = new uint256[](3);
        uint8 index = 0;
        while (index <= 2) {
            uint256 _rng = _getRandomNumber(0, 4);
            if (balanceOf(receiver, _rng) == 0) {
                tokenIds[index] = _rng;
                _internalMint(receiver, _rng);
                index++;
            }
        }
        numberPlayers++;
        receiver.transfer(msg.value);
        emit NewPlayer(receiver, tokenIds);
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

    /// @notice Playoff Function for Battle.sol
    /// @dev Uses RNG to Find # between 0-1000
    /// @dev Returns true for P2, False for P2
    /// @return bool 
    function playoff() override external view onlyWinManager returns (bool) {
        return _getRandomNumber(0, 1000) < 500;
    }

    /// @notice WIN_MANAGER_CALL
    /// @dev On Battle Win -> Win Manager Mints
    /// @param receiever the user that wins
    /// @param tokenId The tokenId to be minted
    function winBattle(address receiever, uint256 tokenId) override external onlyWinManager {
        /// Run Internal Mint for the Winner
        _internalMint(receiever, tokenId);
        /// Check The Tier of the Winner Item
        uint8 tier = metadata[tokenId].tier;
        if ((tier == 1 || tier == 2) && _checkTier(receiever, tier)) {
            uint256 nextTierTokenId = _randomTokenId(tier + 1);
            _internalMint(receiever, nextTierTokenId);
            emit TierUnlocked(receiever, nextTierTokenId, tier + 1);
        }
        /// Else Nothing Since there is not another tier
        
    }

    function _checkTier(address receiver, uint256 tier) internal view returns (bool) {
        uint256 start = tier == 1 ? 0 : 5;
        uint256 stop = tier == 1 ? 5 : 9;
        for (uint256 i = start; i < stop; i++) {
            if (balanceOf(receiver, i) == 0) {
                return false;
            }
        }

        return true;
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

    /// @notice Selects a Random Token Id of the Next Tier
    /// @dev Utilizes RNG Plus Length of Previous Item List
    /// @dev !!! Unsure if the else statement should be here, theoretically impossible !!!
    /// @param tier uint8 of the next tier to select
    /// @return uint256 of the tokenId Selected
    function _randomTokenId(uint8 tier) internal view returns (uint256) {
        /// Tier == 2 -> returns 5, 6, 7, 8
        if (tier == 2) {
            return _getRandomNumber(5, 3);
        /// Tier == 3 -> returns 9, 10, 11
        } else if (tier == 3) {
            return _getRandomNumber(9, 2);
        } else {
            return 0;
        }
    }

    /// @notice SKALE RNG Casting
    /// @param minNumber the Minimum Number
    /// @param maxNumber the Max Number
    /// @return uint256 the returned random number 
    function _getRandomNumber(uint256 minNumber, uint256 maxNumber) internal view returns (uint256) {
        uint256 _rng = minNumber + (uint256(diceRoller.getRandom()) % maxNumber);
        return _rng;
    }
    
}