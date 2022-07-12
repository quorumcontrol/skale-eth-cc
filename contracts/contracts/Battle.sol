// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IGameItems.sol";

/**
*
* Battle for ETH CC
*
* @author Tobower
* @author TheGreatAxios
*
* @dev This smart contract is the core battle logic and reveal for the game
*
**/
contract Battle {

  ////////////////////////////////////////
  //////////////// State /////////////////
  ////////////////////////////////////////

  /// @notice The Game Items Contract Address
  address immutable private gameItemAddress;
  /// @notice The committed list
  mapping(address => bytes32) private committed;
  /// @notice Number of Times Commited
  mapping(address => uint256) private timesCommitted;
  /// @notice Win List
  mapping(address => uint256) private wins;
  /// @notice Loss List
  mapping(address => uint256) private losses;
  /// @notice Draw List
  mapping(address => uint256) private draws;

  ////////////////////////////////////////
  //////////////// Errors ////////////////
  ////////////////////////////////////////

  /// @notice Commit Already Exists Error
  string private constant COMMIT_ALREADY_EXISTS = "Commit Already Exists";
  /// @notice Commit Emtpy Cannot Battle
  string private constant CANNOT_BATTLE = "Comimt Empty: Battle Impossible";

  ////////////////////////////////////////
  //////////////// Events ////////////////
  ////////////////////////////////////////

  /// @notice Emits the End of a Battle
  event BattleCompleted(address indexed playerOne, address indexed playerTwo, uint8 result, uint256 playerOneItem, uint256 playerTwoItem);
  /// @notice Emits a Cheater
  event Cheater(address indexed cheater);
  /// @notice Emits a New Commited Item
  event Commited(address indexed committer, bytes32 indexed commitment, uint256 commitmentNumber);

  /// @dev Sets Game Item Contract to the active Game Items
  /// @dev Script MUST add WIN_MANAGER_ROLE to THIS
  /// @param _gameItemAddress Address of Game Item
  constructor(address _gameItemAddress) {
    gameItemAddress = _gameItemAddress;
  }

  ////////////////////////////////////////
  /////////////// External ///////////////
  ////////////////////////////////////////

    /// @dev The Battle Function
  /// @dev Checks Both the Signer and the Opponent for Items
  /// @dev Takes the bytes32 hash and uses it with token ids to match items for a full return on both ends
  /// @dev Emits an Event With all the data as well?
  function battle(address p2, bytes32 p2Salt, uint256 p2TokenId, bytes32 p1Salt, uint256 p1TokenId) external {
    address p1 = msg.sender;

    /// 1 - Confirm My Salt and Opponent Salt Are NOT Commitable i.e can battle
    require(_canBattle(p1), CANNOT_BATTLE);
    require(_canBattle(p2), CANNOT_BATTLE);

    IGameItems _gameItemsContract = _buildGameItems();

    bytes32 p1Commitment = keccak256(abi.encodePacked(p1Salt, p1TokenId));
    bytes32 p2Commitment = keccak256(abi.encodePacked(p2Salt, p2TokenId));

    require(committed[p1] == p1Commitment, "P1 Commitment Mismatched");
    require(committed[p2] == p2Commitment, "P2 Commitment Mismatched");

    if (_gameItemsContract.balanceOf(p1, p1TokenId) == 0) {
      _removeCommitment(p1);
      _removeCommitment(p2);
      emit Cheater(p1);
    } else if (_gameItemsContract.balanceOf(p2, p2TokenId) >= 1) {
      _removeCommitment(p1);
      _removeCommitment(p2);
      emit Cheater(p2);
    } else {
      /// 3 - Runs Reveal and Battle Logic
      uint8 result = _findWinner(_gameItemsContract, p1TokenId, p2TokenId);
      /// 4 - Set Win/Set Lost
      _setResult(p1, p2, result);
      _mintForWinner(result, p1TokenId, p2TokenId);
      /// 5 - Remove Commitments for Each Player
      _removeCommitment(p1);
      _removeCommitment(p2);
      /// 6 - Emit Battle Event
      emit BattleCompleted(p1, p2, result, p1TokenId, p2TokenId);
    }
  }

  /// @dev Enables Player to Commit an Item
  /// @param commitment Takes a hashed commit and stores on chain
  function commitItem(bytes32 commitment) external {
    require(_canCommit(), COMMIT_ALREADY_EXISTS);
    committed[msg.sender] = commitment;
    timesCommitted[msg.sender] = timesCommitted[msg.sender]++;
    emit Commited(msg.sender, commitment, timesCommitted[msg.sender]);
  }

  /// @dev Gets Current Commitment of a Player
  /// @param player address of player
  /// @return bytes32 current commitment
  function getCommitment(address player) external view returns (bytes32) {
    return committed[player];
  }

  /// @dev Gets Address of The Game Item Contract
  /// @return address of the contract
  function getGameItemContract() external view returns (address) {
    return gameItemAddress;
  }

  /// @dev Retrieves Record for a player
  /// @dev Returns the record in the format Wins-Losses-Draws-BATTLES with each value being uint256 due to mappipng setup
  /// @notice Depending on our thoughts here, although on SKALE it does not matter, we could look to lower the maximum win-loss-draw size as the uint256 size may be much larger than required
  /// @param player the address of the player that the record is for
  /// @return [uint256, uint256, uint256, uint256] WINS-LOSSES-DRAWS-BATTLES
  function getRecord(address player) external view returns (uint256, uint256, uint256, uint256) {
    return (wins[player], losses[player], draws[player], wins[player] + losses[player] + draws[player]);
  }

  ////////////////////////////////////////
  /////////////// Internal ///////////////
  ////////////////////////////////////////

  /// @dev Builds Interface to Game Items Contract
  /// @return IGameItems Returns active interface
  function _buildGameItems() internal view returns (IGameItems) {
    return IGameItems(gameItemAddress);
  }

  /// @dev Checks if the current commit is empty
  /// @dev Used for Battle Check
  /// @param playerToCheck The Player to Check
  /// @return bool if can commit
  function _canBattle(address playerToCheck) internal view returns (bool) {
    return committed[playerToCheck] != "";
  }

  /// @dev Checks if the current commit is empty
  /// @dev Used for New Player Commit 
  /// @return bool if can commit
  function _canCommit() internal view returns (bool) {
    return committed[msg.sender][0] == 0; ///committed[msg.sender] == "";
  }

  /// @dev Finds Winner :) 
  /// @param itemsContract the Game Items Proxy Contract
  /// @param p1TokenId the Token Id Player 1 Commited
  /// @param p2TokenId the tokenId Player 2 Commited
  /// @return bool 0 if P1 wins, 1 if P2 Wins, 2 if Draw
  function _findWinner(IGameItems itemsContract, uint256 p1TokenId, uint256 p2TokenId) internal returns (uint8) {
    /// If Match -> Automatic Draw
    if (p1TokenId == p2TokenId) return 2;
    /// Check P1 Beats
    IGameItems.GameItemMetadata memory p1Item = itemsContract.getOnChainToken(p1TokenId);
    for (uint256 i = 0; i < p1Item.beats.length; i++) {
      if (p1Item.beats[i] == p2TokenId) {
        return 0;
      }
    }
    /// Check P2 Beats
    IGameItems.GameItemMetadata memory p2Item = itemsContract.getOnChainToken(p2TokenId);
    for (uint256 i = 0; i < p2Item.beats.length; i++) {
      if (p2Item.beats[i] == p1TokenId) {
        return 1;
      }
    }
    /// Automatic Return Draw Else
    return 2;


  }

  /// @dev Mints an NFT based on the winner
  /// @dev Interface/Delegate Call out To IGameItems
  /// @dev Contract Becomes Signer with WIN_MANAGER_ROLE
  /// @param itemContract Game Items Contract
  /// @param result of the battle, 0 = P1 Win, 1 = P2 Win, 2 = Skipped (Draw)
  /// @param p1TokenId Player One Token Id
  /// @param p1 Player One Address
  /// @param p2 TokenId Player Two TokenId
  /// @param p2 Player Two Address
  function _mintForWinner(IGameItems itemContract, uint8 result, uint256 p1TokenId, address p1, uint256 p2TokenId, address p2) internal {
    if (result == 0) {
      itemContract.winBattle(p1, p2TokenId);
    } else if (result == 1) {
      itemContract.winBattle(p2, p1TokenId);
    }
  }

  /// @dev Sets the Results for a Player After a Successfull Battle
  /// @param p1 Address of Player 1
  /// @param p2 Address of Player 2
  /// @param result The Result of the battle where 0 = p1 win, 1 = p2 win, 2 = draw
  function _setResult(address p1, address p2, uint8 result) internal {
    if (result == 0) {
      wins[p1] = wins[p1]++;
      losses[p2] = losses[p2]++;
    } else if (result == 1) {
      wins[p2] = wins[p2]++;
      losses[p1] = losses[p1]++;
    } else {
      draws[p1] = draws[p1]++;
      draws[p2] = draws[p2]++;
    }
    
  }

  /// @dev Adds Item to Commit
  /// @dev Removes Commit
  function _removeCommitment(address player) internal {
    delete committed[player];
  }
}