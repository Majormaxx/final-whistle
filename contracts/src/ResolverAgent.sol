// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IMarket.sol";
import "./ISomniaAgent.sol";

// Drives resolution for both MatchMarket and NextGoalMarket via the Somnia Agents platform.
//
// MatchMarket flow (two agent requests per market):
//   1. Keeper calls initiateMatchResolution(market, apiUrl).
//   2. Two createRequest calls are fired: one for goals.home, one for goals.away.
//   3. handleResponse fires twice. On second receipt, outcome is computed and market resolved.
//
// NextGoalMarket flow (two agent requests to get current total goals):
//   1. Keeper calls initiateNextGoalResolution(market, apiUrl).
//   2. Same two-request pattern; at the end: currentTotal > goalsBefore → YES, else NO.
//
// Emergency override: 2-of-3 multisig can force-resolve if the API is unreachable for 24+ hours.
contract ResolverAgent is IAgentRequesterHandler {

    // ── constants ─────────────────────────────────────────────────────────

    // Somnia Testnet (50312)
    address public constant PLATFORM_TESTNET = 0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776;

    // 0.03 STT per validator × default subcommittee of 3
    uint256 public constant PER_AGENT_PRICE  = 0.03 ether;
    uint256 public constant SUBCOMMITTEE     = 3;

    // ── storage ──────────────────────────────────────────────────────────

    address public immutable owner;
    IAgentRequester public immutable platform;
    uint256 public jsonApiAgentId; // set from agents.somnia.network at deploy

    struct ResolutionJob {
        address market;
        bool isMatchMarket;   // false = NextGoalMarket
        bool isHomeRequest;
        uint256 pairedId;     // the other platform requestId
        uint256 goalsBefore;  // NextGoalMarket only
    }

    mapping(uint256 => ResolutionJob) public jobs;     // platform requestId => job
    mapping(uint256 => uint256)       public received; // platform requestId => goals decoded
    mapping(uint256 => bool)          public done;     // platform requestId => response received

    // multisig emergency override 2-of-3
    address[3] public multisig;
    mapping(bytes32 => uint8)                     public emergencyVotes;
    mapping(bytes32 => mapping(address => bool))  public voted;

    // ── events ────────────────────────────────────────────────────────────

    event ResolutionInitiated(address indexed market, uint256 homeReqId, uint256 awayReqId);
    event ResolutionFulfilled(address indexed market, Outcome result);
    event ResolutionFailed(uint256 indexed requestId, ResponseStatus status);
    event EmergencyResolved(address indexed market, Outcome result);

    // ── constructor ───────────────────────────────────────────────────────

    constructor(
        address _platform,
        uint256 _jsonApiAgentId,
        address[3] memory _multisig
    ) {
        owner          = msg.sender;
        platform       = IAgentRequester(_platform);
        jsonApiAgentId = _jsonApiAgentId;
        multisig       = _multisig;
    }

    // ── initiation ────────────────────────────────────────────────────────

    // apiUrl: full URL to the fixtures endpoint, e.g.
    //   "https://v3.football.api-sports.io/fixtures?id=12345"
    //   with an x-apisports-key header injected at the keeper level.
    //
    // Note: caller must send msg.value >= 2 × _requiredDeposit().
    function initiateMatchResolution(
        address market,
        string calldata apiUrl
    ) external payable {
        require(IMarket(market).status() == MarketStatus.CLOSED, "market not closed");
        uint256 d = _requiredDeposit();
        require(msg.value >= d * 2, "insufficient deposit");

        (uint256 homeId, uint256 awayId) = _firePair(apiUrl);

        jobs[homeId] = ResolutionJob(market, true,  true,  awayId, 0);
        jobs[awayId] = ResolutionJob(market, true,  false, homeId, 0);

        emit ResolutionInitiated(market, homeId, awayId);
    }

    function initiateNextGoalResolution(
        address market,
        string calldata apiUrl,
        uint256 goalsBefore
    ) external payable {
        require(IMarket(market).status() == MarketStatus.CLOSED, "market not closed");
        uint256 d = _requiredDeposit();
        require(msg.value >= d * 2, "insufficient deposit");

        (uint256 homeId, uint256 awayId) = _firePair(apiUrl);

        jobs[homeId] = ResolutionJob(market, false, true,  awayId, goalsBefore);
        jobs[awayId] = ResolutionJob(market, false, false, homeId, goalsBefore);

        emit ResolutionInitiated(market, homeId, awayId);
    }

    // ── callback ──────────────────────────────────────────────────────────

    function handleResponse(
        uint256 requestId,
        AgentResponse[] memory responses,
        ResponseStatus status,
        AgentRequest memory /* details */
    ) external override {
        require(msg.sender == address(platform), "only platform");

        if (status != ResponseStatus.Success) {
            emit ResolutionFailed(requestId, status);
            return;
        }

        ResolutionJob memory job = jobs[requestId];
        if (job.market == address(0)) return; // already cleaned up

        uint256 goals = abi.decode(responses[0].result, (uint256));
        received[requestId] = goals;
        done[requestId]     = true;

        uint256 paired = job.pairedId;
        if (!done[paired]) return; // wait for the other half

        uint256 homeGoals = job.isHomeRequest ? goals : received[paired];
        uint256 awayGoals = job.isHomeRequest ? received[paired] : goals;

        _cleanup(requestId, paired);

        Outcome outcome;
        if (job.isMatchMarket) {
            if      (homeGoals > awayGoals) outcome = Outcome.HOME;
            else if (awayGoals > homeGoals) outcome = Outcome.AWAY;
            else                            outcome = Outcome.DRAW;
        } else {
            uint256 total = homeGoals + awayGoals;
            outcome = total > job.goalsBefore ? Outcome.YES : Outcome.NO;
        }

        IMarket(job.market).resolve(outcome);
        emit ResolutionFulfilled(job.market, outcome);
    }

    // ── emergency override ────────────────────────────────────────────────

    function approveEmergencyResolution(address market, Outcome outcome) external {
        require(_isMultisig(msg.sender), "not multisig");
        bytes32 key = keccak256(abi.encodePacked(market, outcome));
        require(!voted[key][msg.sender], "already voted");
        voted[key][msg.sender]  = true;
        emergencyVotes[key]++;
        if (emergencyVotes[key] >= 2) {
            emergencyVotes[key] = 0;
            IMarket(market).resolve(outcome);
            emit EmergencyResolved(market, outcome);
        }
    }

    // ── admin ─────────────────────────────────────────────────────────────

    function setJsonApiAgentId(uint256 id) external {
        require(msg.sender == owner, "only owner");
        jsonApiAgentId = id;
    }

    function requiredDeposit() external view returns (uint256) {
        return _requiredDeposit();
    }

    // ── internal ──────────────────────────────────────────────────────────

    function _firePair(string calldata apiUrl) internal returns (uint256 homeId, uint256 awayId) {
        uint256 d = _requiredDeposit();

        bytes memory homePayload = abi.encodeWithSignature(
            "fetchUint(string,string,uint8)",
            apiUrl,
            "response.0.goals.home",
            uint8(0)
        );
        bytes memory awayPayload = abi.encodeWithSignature(
            "fetchUint(string,string,uint8)",
            apiUrl,
            "response.0.goals.away",
            uint8(0)
        );

        homeId = platform.createRequest{value: d}(
            jsonApiAgentId, address(this), this.handleResponse.selector, homePayload
        );
        awayId = platform.createRequest{value: d}(
            jsonApiAgentId, address(this), this.handleResponse.selector, awayPayload
        );
    }

    function _requiredDeposit() internal view returns (uint256) {
        return platform.getRequestDeposit() + PER_AGENT_PRICE * SUBCOMMITTEE;
    }

    function _cleanup(uint256 a, uint256 b) internal {
        delete jobs[a]; delete jobs[b];
        delete received[a]; delete received[b];
        delete done[a]; delete done[b];
    }

    function _isMultisig(address addr) internal view returns (bool) {
        return addr == multisig[0] || addr == multisig[1] || addr == multisig[2];
    }

    receive() external payable {}
}
