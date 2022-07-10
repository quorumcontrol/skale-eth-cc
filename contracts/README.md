# SKALE ETH CC Smart Contracts
## Overview
---
This submodule contains the smart contracts for skale-eth-cc repository. The smart contracts represent a mini game modeled after rock-paper-scissors that shows off the power of SKALE. 

## Contract Information
---
### Interfaces
IGameItems.sol

### Contracts
Battle.sol
GameItems.ol

### To Do
- [x] IGameItems.sol
    - [x] Craft Function
    - [x] GetOnChainToken Function
    - [x] Initial Mint Function
    - [x] Toggle Lock Function
- [ ] GameItems.sol
    - [x] ADMIN_ROLE - ?? - @Topper?
    - [x] WIN_MANAGER_ROLE - ?? - Give Ability to Mint a single NFT on a Win if it does not already exists
    - [x] MINTER_ROLE - Gives ability to mint initial NFTs
    - [x] RNG for Random Mint - On Initial Mint, use RNG to provide 3 Random NFTs, 2 from the core list, 1 from the custom list?
    - [x] Combination Function - Takes 2 NFTs and Combines them to make a new one, does not result in a loss of any NFTs
    - [x] Pull Status Function - Pulls status of user in the form of a dynamic array. Will show empty spaces and names for non-available NFTs
    - [] Block Transfer Until X Date
    - [ ] Set Graphics as private and unrevealed by user
        - [ ] Mapping of Token Id -> String 
        - [ ] Available via Internal Call Only to load Token URI
        - [ ] Can only load if owner of TokenURI (during conference)
            - [ ] Utilize Time Check
- [ ] Battle.sol
   - [ ] Tweak storage or rounds to single mapping with struct
   - [ ] Each user can update the mapping to set an item
   - [ ] Each user can update the mapping to remove an item
   - [ ] Battle Function (From QR Code Scan on Client)
    - [ ] Takes (Address, Hash)[2] as argument
    - [ ] Runs Salts+ItemId against existing hash, once matched use to load items by player
    - [ ] Use Game Items interface to check the battle result
    - [ ] Delete Each users set item from user mapping
    - [ ] Mint new NFT if winner of the opponents NFT if it does not exist
    - [ ] Add Generic Round Result to Battle Contract