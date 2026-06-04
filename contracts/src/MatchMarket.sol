// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IMarket.sol";
import "./LMSR.sol";

// 1X2 match-winner market with LMSR pricing.
// HOME=0, DRAW=1, AWAY=2 map to Outcome.HOME/DRAW/AWAY.
contract MatchMarket is IMarket {
    using LMSR for uint256[3];

    // ── storage ──────────────────────────────────────────────────────────

    bytes32 public immutable override marketId;
    address public immutable factory;
    address public immutable resolver;

    string public homeTeam;
    string public awayTeam;
    uint256 public kickoff;       // unix timestamp
    uint256 public immutable b;   // LMSR liquidity parameter (scaled 1e18)

    MarketStatus public override status;
    Outcome public result;

    // quantity shares sold per outcome [HOME, DRAW, AWAY]
    uint256[3] public quantities;

    // shares owned per user per outcome
    mapping(address => uint256[3]) public shares;

    // total pool collected (native token)
    uint256 public pool;

    uint256 public constant PAYOUT_CAP = 1000;
    uint256 public participantCount;
    mapping(address => bool) public isParticipant;

    // ── events ────────────────────────────────────────────────────────────

    event BetPlaced(address indexed bettor, uint8 outcome, uint256 shares, uint256 cost);
    event MarketResolved(Outcome result);
    event PayoutSent(address indexed bettor, uint256 amount);

    // ── constructor ───────────────────────────────────────────────────────

    constructor(
        bytes32 _marketId,
        address _resolver,
        string memory _homeTeam,
        string memory _awayTeam,
        uint256 _kickoff,
        uint256 _b
    ) {
        marketId  = _marketId;
        factory   = msg.sender;
        resolver  = _resolver;
        homeTeam  = _homeTeam;
        awayTeam  = _awayTeam;
        kickoff   = _kickoff;
        b         = _b;
        status    = MarketStatus.OPEN;
    }

    // ── betting ───────────────────────────────────────────────────────────

    // outcome: 0=HOME, 1=DRAW, 2=AWAY
    function bet(uint8 outcome) external payable {
        require(status == MarketStatus.OPEN, "market not open");
        require(outcome < 3, "invalid outcome");
        require(msg.value > 0, "zero value");

        uint256 shareCost = LMSR.cost(quantities, outcome, msg.value, b);
        require(shareCost <= msg.value, "cost exceeds payment");

        quantities[outcome] += msg.value;
        shares[msg.sender][outcome] += msg.value;
        pool += msg.value;

        if (!isParticipant[msg.sender]) {
            isParticipant[msg.sender] = true;
            participantCount++;
        }

        // refund overpayment
        uint256 refund = msg.value - shareCost;
        if (refund > 0) {
            (bool ok,) = msg.sender.call{value: refund}("");
            require(ok, "refund failed");
            pool -= refund;
        }

        emit BetPlaced(msg.sender, outcome, msg.value, shareCost);
    }

    // ── resolution ────────────────────────────────────────────────────────

    function resolve(Outcome outcome) external override {
        require(msg.sender == resolver, "only resolver");
        require(status == MarketStatus.CLOSED, "not resolvable");
        require(
            outcome == Outcome.HOME || outcome == Outcome.DRAW || outcome == Outcome.AWAY,
            "invalid outcome"
        );
        status = MarketStatus.RESOLVED;
        result = outcome;
        emit MarketResolved(outcome);
    }

    function close() external {
        require(msg.sender == resolver || block.timestamp >= kickoff + 2 hours, "not closeable");
        require(status == MarketStatus.OPEN, "not open");
        status = MarketStatus.CLOSED;
    }

    // ── payout ────────────────────────────────────────────────────────────

    // Push payouts to a batch of winners. Callable by anyone (frontend calls on resolution).
    function payoutBatch(address[] calldata bettors) external {
        require(status == MarketStatus.RESOLVED, "not resolved");
        uint8 winOutcome = _outcomeIndex(result);
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

    // Pull claim for markets exceeding PAYOUT_CAP participants.
    function claim() external {
        require(status == MarketStatus.RESOLVED, "not resolved");
        uint8 winOutcome = _outcomeIndex(result);
        uint256 winShares = shares[msg.sender][winOutcome];
        require(winShares > 0, "nothing to claim");
        shares[msg.sender][winOutcome] = 0;
        uint256 payout = pool * winShares / quantities[winOutcome];
        (bool ok,) = msg.sender.call{value: payout}("");
        require(ok, "claim failed");
        emit PayoutSent(msg.sender, payout);
    }

    // ── views ─────────────────────────────────────────────────────────────

    function getPrice(uint8 outcome) external view returns (uint256) {
        return LMSR.price(quantities, outcome, b);
    }

    function getQuantities() external view returns (uint256[3] memory) {
        return quantities;
    }

    // ── internal ──────────────────────────────────────────────────────────

    function _outcomeIndex(Outcome o) internal pure returns (uint8) {
        if (o == Outcome.HOME) return 0;
        if (o == Outcome.DRAW) return 1;
        return 2;
    }

    receive() external payable {}
}
