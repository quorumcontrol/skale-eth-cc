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

  /// @notice The Game Items Contract Address
  address immutable gameItemAddress;

  /// @notice The committed list
  mapping(address => bytes32) private committed;
  /// @notice Win List
  mapping(address => uint256) private wins;
  /// @notice Loss List
  mapping(address => uint256) private losses;
  /// @notice Draw List
  mapping(address => uint256) private draws;

  /// @notice Commit Already Exists Error
  string private constant COMMIT_ALREADY_EXISTS = "Commit Already Exists";
  /// @notice Commit Emtpy Cannot Battle
  string private constant CANNOT_BATTLE = "Comimt Empty: Battle Impossible";

  /// @notice Emits the End of a Battle
  event BattleCompleted(address indexed playerOne, address indexed playerTwo, uint8 result, uint256 playerOneItem, uint256 playerTwoItem);

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
  function battle(address opponent, bytes32 mySalt, bytes32 opponentSalt) external {
    address _p1 = msg.sender;
    address _p2 = opponent;

    /// 1 - Confirm My Salt and Opponent Salt Are NOT Commitable i.e can battle
    require(!_canBattle(_p1), CANNOT_BATTLE);
    require(!_canBattle(_p2), CANNOT_BATTLE);

    /// 2 - Loops through the # of Items on GameItems Contract, Attempts to Match Salt with TokenId for each player

    IGameItems _gameItemsContract = _buildGameItems();

    /// Loads Number of Items to Loop Through
    uint256 _numberItems = _gameItemsContract.getNumberItems();
    uint256 _p1TokenId = 1000; /// Initial Setting of MyTokenId
    uint256 _p2TokenId = 1000; /// Initial Setting of Opponent Token Id

    /// Loops Through # of Items
    for (uint i = 0; i < _numberItems; i++) {
      /// If True === Not Found yet, Continue Loop
      if (_p1TokenId == 1000) {
        /// Geneate Hash of Salt + "+" + tokenId
        bytes32 _hash = keccak256(abi.encodePacked(mySalt,"+", i));
        /// If Match -> Set Token id
        if (_hash == committed[msg.sender]) _p1TokenId = i;
      }

      if (_p2TokenId == 1000) {
        bytes32 _hash = keccak256(abi.encodePacked(opponentSalt,"+", i));
        if (_hash == committed[opponent]) _p2TokenId = i;
      }

      /// If Both Players are found, break
      if (_p1TokenId != 1000 && _p2TokenId != 1000) break;

    }

    require(_p1TokenId != 1000, "Player One Commitment Error");
    require(_p2TokenId != 1000, "Player Two Commitment Error");

    /// 3 - Runs Reveal and Battle Logic
    uint8 result = _findWinner(_gameItemsContract, _p1TokenId, _p2TokenId);
    /// 4 - Set Win/Set Lost
    _setResult(_p1, _p2, result);
    /// 5 - Remove Commitments for Each Player
    _removeCommitment(msg.sender);
    _removeCommitment(opponent);
    /// 6 - Emit Battle Event
    emit BattleCompleted(msg.sender, opponent, result, _p1TokenId, _p2TokenId); /// TO DO FIX
  }

  /// @dev Enables Player to Commit an Item
  /// @param commitment Takes a hashed commit and stores on chain
  function commitItem(bytes32 commitment) external {
    require(_canCommit(), COMMIT_ALREADY_EXISTS);
    committed[msg.sender] = commitment;
  }

  /// @dev Gets Address of The Game Item Contract
  /// @return address of the contract
  function getGameItemContract() external view returns (address) {
    return gameItemAddress;
  }

  
  ////////////////////////////////////////
  /////////////// Internal ///////////////
  ////////////////////////////////////////

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
    return committed[msg.sender] == "";
  }

  /// @dev Finds Winner :) 
  /// @return bool 0 if P1 wins, 1 if P2 Wins, 3 if Draw
  function _findWinner(IGameItems itemsContract, uint256 p1TokenId, uint256 p2TokenId) internal returns (uint8) {
    /// If Match -> Automatic Draw
    if (p1TokenId == p2TokenId) return 3;
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
    return 3;


  }

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