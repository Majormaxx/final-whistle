// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IMarket.sol";

// Receives consensus results from the Somnia Agents validator platform
// and writes them into the originating market.
//
// Flow:
//   1. Off-chain keeper calls requestResolution() to initiate an agent job.
//   2. Somnia Agents platform fetches the sports API independently with a
//      validator subcommittee, reaches consensus, then calls fulfillResolution().
//   3. fulfillResolution() writes the result into the market contract.
//
// The multisig override (resolveEmergency) exists only as a circuit breaker
// for the case where the API has been unreachable for 24+ hours.
contract ResolverAgent {

    address public immutable owner;
    address public agentPlatform;  // Somnia Agents callback address

    // requestId => market address
    mapping(bytes32 => address) public pendingRequests;

    // multisig override — requires 2-of-3
    address[3] public multisig;
    mapping(bytes32 => uint8) public emergencyApprovals;
    mapping(bytes32 => mapping(address => bool)) public hasApproved;

    event ResolutionRequested(bytes32 indexed requestId, address indexed market, string apiPath);
    event ResolutionFulfilled(bytes32 indexed requestId, address indexed market, Outcome result);
    event EmergencyResolved(address indexed market, Outcome result);

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    modifier onlyAgentPlatform() {
        require(msg.sender == agentPlatform, "only agent platform");
        _;
    }

    constructor(address _agentPlatform, address[3] memory _multisig) {
        owner         = msg.sender;
        agentPlatform = _agentPlatform;
        multisig      = _multisig;
    }

    // ── resolution flow ───────────────────────────────────────────────────

    // Called by a keeper or the factory after market close.
    // apiPath: e.g. "/fixtures?id=12345" — the Somnia Agent resolves this
    //          against the configured sports API base URL.
    function requestResolution(
        address market,
        string calldata apiPath
    ) external returns (bytes32 requestId) {
        require(
            IMarket(market).status() == MarketStatus.CLOSED,
            "market not closed"
        );
        requestId = keccak256(abi.encodePacked(market, block.timestamp, apiPath));
        pendingRequests[requestId] = market;
        emit ResolutionRequested(requestId, market, apiPath);
        // In production the Somnia Agents platform listens for this event
        // and initiates the off-chain fetch + validator consensus job.
    }

    // Called by the Somnia Agents platform after validator consensus.
    // outcomeRaw: 0=HOME/YES, 1=DRAW/NO, 2=AWAY (MatchMarket only)
    function fulfillResolution(bytes32 requestId, uint8 outcomeRaw) external onlyAgentPlatform {
        address market = pendingRequests[requestId];
        require(market != address(0), "unknown request");
        delete pendingRequests[requestId];

        Outcome outcome = Outcome(outcomeRaw + 1); // enum offset: NONE=0
        IMarket(market).resolve(outcome);
        emit ResolutionFulfilled(requestId, market, outcome);
    }

    // ── emergency override ────────────────────────────────────────────────

    // Circuit breaker: any multisig member approves; 2-of-3 executes.
    function approveEmergencyResolution(
        address market,
        Outcome outcome
    ) external {
        require(_isMultisig(msg.sender), "not multisig");
        bytes32 key = keccak256(abi.encodePacked(market, outcome));
        require(!hasApproved[key][msg.sender], "already approved");
        hasApproved[key][msg.sender] = true;
        emergencyApprovals[key]++;

        if (emergencyApprovals[key] >= 2) {
            emergencyApprovals[key] = 0;
            IMarket(market).resolve(outcome);
            emit EmergencyResolved(market, outcome);
        }
    }

    // ── admin ─────────────────────────────────────────────────────────────

    function setAgentPlatform(address _platform) external onlyOwner {
        agentPlatform = _platform;
    }

    function _isMultisig(address addr) internal view returns (bool) {
        return addr == multisig[0] || addr == multisig[1] || addr == multisig[2];
    }
}
