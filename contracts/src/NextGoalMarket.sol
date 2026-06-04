// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IMarket.sol";
import "./LMSR.sol";

// Binary "goal in next N minutes" market. Spawned reactively per window.
// YES=0, NO=1
contract NextGoalMarket is IMarket {
    using LMSR for uint256[2];

    bytes32 public immutable override marketId;
    address public immutable factory;
    address public immutable resolver;

    bytes32 public immutable parentMatchId;
    uint256 public immutable windowStart;  // unix timestamp
    uint256 public immutable windowEnd;    // unix timestamp
    uint256 public immutable goalsBefore;  // goal count at window open
    uint256 public immutable b;

    MarketStatus public override status;
    Outcome public result;

    uint256[2] public quantities; // [YES, NO]
    mapping(address => uint256[2]) public shares;
    uint256 public pool;

    event BetPlaced(address indexed bettor, uint8 outcome, uint256 shares, uint256 cost);
    event MarketResolved(Outcome result);
    event PayoutSent(address indexed bettor, uint256 amount);

    constructor(
        bytes32 _marketId,
        address _resolver,
        bytes32 _parentMatchId,
        uint256 _windowStart,
        uint256 _windowEnd,
        uint256 _goalsBefore,
        uint256 _b
    ) {
        marketId      = _marketId;
        factory       = msg.sender;
        resolver      = _resolver;
        parentMatchId = _parentMatchId;
        windowStart   = _windowStart;
        windowEnd     = _windowEnd;
        goalsBefore   = _goalsBefore;
        b             = _b;
        status        = MarketStatus.OPEN;
    }

    // outcome: 0=YES, 1=NO
    function bet(uint8 outcome) external payable {
        require(status == MarketStatus.OPEN, "market not open");
        require(outcome < 2, "invalid outcome");
        require(msg.value > 0, "zero value");
        require(block.timestamp < windowEnd, "window closed");

        uint256[3] memory q3 = _to3(quantities);
        uint256 shareCost = LMSR.cost(q3, outcome, msg.value, b);
        require(shareCost <= msg.value, "cost exceeds payment");

        quantities[outcome] += msg.value;
        shares[msg.sender][outcome] += msg.value;
        pool += msg.value;

        uint256 refund = msg.value - shareCost;
        if (refund > 0) {
            (bool ok,) = msg.sender.call{value: refund}("");
            require(ok, "refund failed");
            pool -= refund;
        }

        emit BetPlaced(msg.sender, outcome, msg.value, shareCost);
    }

    function resolve(Outcome outcome) external override {
        require(msg.sender == resolver, "only resolver");
        require(status == MarketStatus.CLOSED, "not resolvable");
        require(outcome == Outcome.YES || outcome == Outcome.NO, "invalid outcome");
        status = MarketStatus.RESOLVED;
        result = outcome;
        emit MarketResolved(outcome);
    }

    function close() external {
        require(msg.sender == resolver || block.timestamp >= windowEnd, "not closeable");
        require(status == MarketStatus.OPEN, "not open");
        status = MarketStatus.CLOSED;
    }

    function payoutBatch(address[] calldata bettors) external {
        require(status == MarketStatus.RESOLVED, "not resolved");
        uint8 winOutcome = result == Outcome.YES ? 0 : 1;
        uint256 totalWinShares = quantities[winOutcome];
        require(totalWinShares > 0, "no winners");

        for (uint256 i = 0; i < bettors.length; i++) {
            address bettor = bettors[i];
            uint256 winShares = shares[bettor][winOutcome];
            if (winShares == 0) continue;
            shares[bettor][winOutcome] = 0;
            uint256 payout = pool * winShares / totalWinShares;
            (bool ok,) = bettor.call{value: payout}("");
            require(ok, "payout failed");
            emit PayoutSent(bettor, payout);
        }
    }

    function claim() external {
        require(status == MarketStatus.RESOLVED, "not resolved");
        uint8 winOutcome = result == Outcome.YES ? 0 : 1;
        uint256 winShares = shares[msg.sender][winOutcome];
        require(winShares > 0, "nothing to claim");
        shares[msg.sender][winOutcome] = 0;
        uint256 payout = pool * winShares / quantities[winOutcome];
        (bool ok,) = msg.sender.call{value: payout}("");
        require(ok, "claim failed");
        emit PayoutSent(msg.sender, payout);
    }

    function getPrice(uint8 outcome) external view returns (uint256) {
        uint256[3] memory q3 = _to3(quantities);
        return LMSR.price(q3, outcome, b);
    }

    // pad 2-element array into 3-element for LMSR (third slot stays zero)
    function _to3(uint256[2] memory q) internal pure returns (uint256[3] memory q3) {
        q3[0] = q[0];
        q3[1] = q[1];
        q3[2] = 0;
    }

    receive() external payable {}
}
