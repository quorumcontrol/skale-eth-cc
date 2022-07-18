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
    /// @notice The mapping for tier unlocked
    mapping(uint256 => mapping(address => bool)) private tierTracker;

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
    event NewPlayer(address indexed newPlayer, uint256[3] indexed initialTokens);

    /// @notice Emits a TierUnlocked allowing for the frontend to notify the player
    /// @dev Used inside the [winBattle] function
    /// @param player The [player] who is unlocked a new tier
    /// @param tokenId The [tokenId] that was granted for this new tier
    /// @param tier The [tier] that was unlocked
    event TierUnlocked(address indexed player, uint256 indexed tokenId, uint8 indexed tier);

    /// @notice Emits a Winner event
    /// @dev Fires once a player has all of the last tier of items
    /// @param player the address of the winner
    event Winner(address indexed player);

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

    /// @notice Admin Function that enables the admin owner to add new tokens to the contract storage
    /// @dev Creates Metadata -> Stores as New Index
    /// @dev Sets Token URI for Backward Compatability with Marketplaces
    /// @dev Updates Number Of Items
    /// @dev Emits [NewItem] event
    /// @param name Name of the Item
    /// @param description Description of the Item
    /// @param image Image of the Item
    /// @param animation Animation of the Item
    /// @param beats List of who the token beats
    /// @param tokenURI Gen I Token URI
    function addItem(uint8 tier, string memory name, string memory description, string memory image, string memory animation, uint256[] memory beats, string memory tokenURI) override external onlyAdmin {
        uint256 _currentItemIndex = numberItems;
        GameItemMetadata memory newItem = GameItemMetadata(tier, name, description, image, animation, beats);
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
    /// @return 
    function getNumberPlayers() override external view returns (uint256) {
        return numberPlayers;
    }

    /// @notice Retrieves the Total Number of Items in the Game
    /// @return uint256 of the number of active game items
    function getNumberItems() external view returns (uint256) {
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

        uint256[3] memory opt1 = [uint256(0),1,2];
        uint256[3] memory opt2 = [uint256(1),2,3];
        uint256[3] memory opt3 = [uint256(2),3,4];
        uint256[3] memory opt4 = [uint256(0),2,4];
        uint256[3] memory opt5 = [uint256(1),3,4];
        uint256 _rng = _getRandomNumber(0, 4);

        uint256[3] memory tokenIds = [uint256(0), 0, 0];

        if (_rng == 0) {
            for (uint256 i = 0; i < 3; i++) {
                _internalMint(receiver, opt1[i]);
                tokenIds = opt1;
            }
        } else if (_rng == 1) {
            for (uint256 i = 0; i < 3; i++) {
                _internalMint(receiver, opt2[i]);
                tokenIds = opt2;
            }
        } else if (_rng == 2) {
            for (uint256 i = 0; i < 3; i++) {
                _internalMint(receiver, opt3[i]);
                tokenIds = opt3;
            }
        } else if (_rng == 3) {
            for (uint256 i = 0; i < 3; i++) {
                _internalMint(receiver, opt4[i]);
                tokenIds = opt4;
            }
        } else if (_rng == 4) {
            for (uint256 i = 0; i < 3; i++) {
                _internalMint(receiver, opt5[i]);
                tokenIds = opt5;
                
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
        if ((tier == 0 || tier == 1) && _checkTier(receiever, tier) && !_tierUnlocked(receiever, tier + 1)) {
            uint256 nextTierTokenId = _randomTokenId(tier + 1);
            _internalMint(receiever, nextTierTokenId);
            _unlockTier(receiever,  tier + 1);
            emit TierUnlocked(receiever, nextTierTokenId, tier + 1);
        }

        /// Else if Tier 3 Check For Winner
        if (tier == 2 && !_tierUnlocked(receiever, 3)) {
            bool _isWinner = _checkWinner(receiever);
            if (_isWinner) {
                _unlockTier(receiever, 3);
                emit Winner(receiever);
            }
        }
    }

    /// @dev Checks if a player is a winner
    /// @param receiver the player to check
    /// @return bool if the player has completed Tier III
    function _checkWinner(address receiver) internal view returns (bool) {
        for (uint256 i = 9; i < 12; i++) {
            if (balanceOf(receiver, i) == 0) {
                return false;
            }
        }
        return true;
    }


    /// @dev Checks if a player has completed the tier that is being checked
    /// @param receiver the player to check
    /// @param tier the tier to check
    /// @return bool if the player has completed the tier
    function _checkTier(address receiver, uint256 tier) internal view returns (bool) {
        uint256 start = tier == 0 ? 0 : 5;
        uint256 stop = tier == 0 ? 5 : 9;
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
        if (tier == 1) {
            return _getRandomNumber(5, 3);
        /// Tier == 3 -> returns 9, 10, 11
        } else if (tier == 2) {
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

    /// @notice Checks if User has unlocked a tier
    /// @param player address
    /// @param tier uint8 of the tier
    /// @return bool true if the user has already unlocked a tier or if they won
    function _tierUnlocked(address player, uint8 tier) internal view returns (bool) {
        return tierTracker[tier][player];
    }

    /// @notice Unlocks Tier for PLayer
    /// @param player address
    /// @param tier uint8 of the tier
    function _unlockTier(address player, uint8 tier) internal {
        tierTracker[tier][player] = true;
    }

    
}