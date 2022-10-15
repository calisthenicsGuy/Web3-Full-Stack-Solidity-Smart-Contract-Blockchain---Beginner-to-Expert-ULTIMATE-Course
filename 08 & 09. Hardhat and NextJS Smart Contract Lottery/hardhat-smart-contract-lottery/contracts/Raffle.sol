// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// Imports
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import '@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol';
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';

// Errors
error Raffle__NotEnoughETHEntered();
error Raffle__ErrorWhilePickedTheWinnerTransaction();
error Raffle__NotOpen();
error Raffle_UpKeepNotNeeded(uint256 contractBalance, uint256 playersLength, uint256 raffleState);

/// @title A sample Raffle Contract
/// @author Radoslav Radev
/// @notice This contract is for creating a sample raffle contrcat
/// @dev This implements the Chainlink VRF Version 2
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    // State variables
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfConsumerBaseV2;
    bytes32  private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;

    address private s_recentWinner;
    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;
    
    // Events
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    /* Functions */
        /* Constructor */
    constructor(
        address vrfCoordinatorV2,
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfConsumerBaseV2 = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
    }

    /* Public functions */
    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughETHEntered();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__NotOpen();
        }

        s_players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    function checkUpkeep(
        bytes memory /* checkData */
    ) 
        public
        override
        returns (
            bool upKeepNeeded,
            bytes memory /* performData */
        )
        {
            bool isOpen = (RaffleState.OPEN == s_raffleState);
            bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
            bool hasPlayers = (s_players.length > 0);
            bool hasBalance = address(this).balance > 0;
            upKeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
        }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        (bool upKeepNeeded, ) = checkUpkeep("");

        if (!upKeepNeeded) {
            revert Raffle_UpKeepNotNeeded(address(this).balance, s_players.length, uint256(s_raffleState));
        }

        s_raffleState = RaffleState.CALCULATING;

       uint256 requestId = i_vrfConsumerBaseV2.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        emit RequestedRaffleWinner(requestId);
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) 
        internal
        override 
        {
            uint256 indexOfWinner = randomWords[0] % s_players.length;
            address payable recentWinner = s_players[indexOfWinner];
            s_recentWinner = recentWinner;
            s_players = new address payable[](0);
            s_lastTimeStamp = block.timestamp;
            
            (bool success, ) = recentWinner.call{value: address(this).balance}("");
            // require(success)
            if (!success) {
                revert Raffle__ErrorWhilePickedTheWinnerTransaction();
            }

            s_raffleState = RaffleState.OPEN;
            emit WinnerPicked(recentWinner);
        }

    /* View / Pure functions // Getter functions */
    function getEntranceFee() public view returns(uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns(address) {
        return s_players[index];
    }

    function getRecentWinner() public view returns(address) {
        return s_recentWinner;
    }

    function getLastTimeStamp() public view returns(uint256) {
        return s_lastTimeStamp;
    }

    function getNumberOfPlayers() public view returns(uint256) {
        return s_players.length;
    }

    function getInterval() public view returns(uint256) {
        return i_interval;
    }

    function getRaffleState() public view returns(RaffleState) {
        return s_raffleState;
    }

    function getRequestConfirmations() public pure returns(uint16) {
        return REQUEST_CONFIRMATIONS;
    }

    function getNumWords() public pure returns(uint32) {
        return NUM_WORDS;
    }
}