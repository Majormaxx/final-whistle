// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MatchMarket.sol";
import "./NextGoalMarket.sol";

// Deploys and indexes all Final Whistle markets.
// The indexer and UI subscribe to MarketCreated / NextGoalMarketCreated events.
contract MarketFactory {

    address public immutable owner;
    address public resolver;

    // default LMSR liquidity parameter — 100 SOMI equivalent (scaled 1e18)
    uint256 public defaultB = 100e18;

    mapping(bytes32 => address) public matchMarkets;
    mapping(bytes32 => address[]) public nextGoalMarkets; // parentMatchId => windows

    event MatchMarketCreated(
        bytes32 indexed marketId,
        address market,
        string homeTeam,
        string awayTeam,
        uint256 kickoff
    );

    event NextGoalMarketCreated(
        bytes32 indexed marketId,
        address market,
        bytes32 indexed parentMatchId,
        uint256 windowStart,
        uint256 windowEnd
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor(address _resolver) {
        owner    = msg.sender;
        resolver = _resolver;
    }

    // ── market creation ───────────────────────────────────────────────────

    function createMatchMarket(
        string calldata homeTeam,
        string calldata awayTeam,
        uint256 kickoff
    ) external onlyOwner returns (address market, bytes32 marketId) {
        require(kickoff > block.timestamp, "kickoff in past");

        marketId = keccak256(abi.encodePacked(homeTeam, awayTeam, kickoff));
        require(matchMarkets[marketId] == address(0), "market exists");

        MatchMarket m = new MatchMarket(
            marketId,
            resolver,
            homeTeam,
            awayTeam,
            kickoff,
            defaultB
        );
        market = address(m);
        matchMarkets[marketId] = market;

        emit MatchMarketCreated(marketId, market, homeTeam, awayTeam, kickoff);
    }

    // Spawned reactively when the parent match goes LIVE.
    // goalsBefore: goal count at the moment this window opens.
    function spawnNextGoalMarket(
        bytes32 parentMatchId,
        uint256 windowStart,
        uint256 windowEnd,
        uint256 goalsBefore
    ) external returns (address market, bytes32 marketId) {
        require(msg.sender == resolver || msg.sender == owner, "unauthorized");
        require(windowEnd > windowStart, "invalid window");
        require(matchMarkets[parentMatchId] != address(0), "unknown match");

        marketId = keccak256(abi.encodePacked(parentMatchId, windowStart, windowEnd));

        NextGoalMarket m = new NextGoalMarket(
            marketId,
            resolver,
            parentMatchId,
            windowStart,
            windowEnd,
            goalsBefore,
            defaultB
        );
        market = address(m);
        nextGoalMarkets[parentMatchId].push(market);

        emit NextGoalMarketCreated(marketId, market, parentMatchId, windowStart, windowEnd);
    }

    // ── views ─────────────────────────────────────────────────────────────

    function getNextGoalMarkets(bytes32 matchId) external view returns (address[] memory) {
        return nextGoalMarkets[matchId];
    }

    // ── admin ─────────────────────────────────────────────────────────────

    function setResolver(address _resolver) external onlyOwner {
        resolver = _resolver;
    }

    function setDefaultB(uint256 _b) external onlyOwner {
        defaultB = _b;
    }
}
