import { Address, Log, Hash, PublicClient, WalletClient, Hex } from 'viem';
import { PrivateKeyAccount } from 'viem/accounts';

declare const MatchMarketAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "_marketId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "_resolver";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_homeTeam";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "_awayTeam";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "_kickoff";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_b";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "receive";
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "PAYOUT_CAP";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "awayTeam";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "b";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "bet";
    readonly inputs: readonly [{
        readonly name: "outcome";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "claim";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "close";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "factory";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getPrice";
    readonly inputs: readonly [{
        readonly name: "outcome";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getQuantities";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256[3]";
        readonly internalType: "uint256[3]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "homeTeam";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "isParticipant";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "kickoff";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "marketId";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "participantCount";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "payoutBatch";
    readonly inputs: readonly [{
        readonly name: "bettors";
        readonly type: "address[]";
        readonly internalType: "address[]";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "pool";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "quantities";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "resolve";
    readonly inputs: readonly [{
        readonly name: "outcome";
        readonly type: "uint8";
        readonly internalType: "enum Outcome";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "resolver";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "result";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "enum Outcome";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "shares";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "status";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "enum MarketStatus";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "BetPlaced";
    readonly inputs: readonly [{
        readonly name: "bettor";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "outcome";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "uint8";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "cost";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "MarketResolved";
    readonly inputs: readonly [{
        readonly name: "result";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "enum Outcome";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PayoutSent";
    readonly inputs: readonly [{
        readonly name: "bettor";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}];

declare const NextGoalMarketAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "_marketId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "_resolver";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_parentMatchId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "_windowStart";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_windowEnd";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_goalsBefore";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_b";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "receive";
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "b";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "bet";
    readonly inputs: readonly [{
        readonly name: "outcome";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "claim";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "close";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "factory";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getPrice";
    readonly inputs: readonly [{
        readonly name: "outcome";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "goalsBefore";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "marketId";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "parentMatchId";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "payoutBatch";
    readonly inputs: readonly [{
        readonly name: "bettors";
        readonly type: "address[]";
        readonly internalType: "address[]";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "pool";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "quantities";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "resolve";
    readonly inputs: readonly [{
        readonly name: "outcome";
        readonly type: "uint8";
        readonly internalType: "enum Outcome";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "resolver";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "result";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "enum Outcome";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "shares";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "status";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "enum MarketStatus";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "windowEnd";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "windowStart";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "BetPlaced";
    readonly inputs: readonly [{
        readonly name: "bettor";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "outcome";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "uint8";
    }, {
        readonly name: "shares";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "cost";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "MarketResolved";
    readonly inputs: readonly [{
        readonly name: "result";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "enum Outcome";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PayoutSent";
    readonly inputs: readonly [{
        readonly name: "bettor";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}];

declare enum MarketStatus {
    Open = 0,
    Closed = 1,
    Resolved = 2,
    Cancelled = 3
}
declare enum Outcome {
    None = 0,
    Home = 1,
    Draw = 2,
    Away = 3,
    Yes = 4,
    No = 5
}
declare enum ResponseStatus {
    None = 0,
    Pending = 1,
    Success = 2,
    Failed = 3,
    TimedOut = 4
}
interface MatchMarketInfo {
    address: Address;
    marketId: Hash;
    homeTeam: string;
    awayTeam: string;
    kickoff: bigint;
    status: MarketStatus;
    result: Outcome;
    pool: bigint;
    quantities: [bigint, bigint, bigint];
    prices: [bigint, bigint, bigint];
}
interface NextGoalMarketInfo {
    address: Address;
    marketId: Hash;
    parentMatchId: Hash;
    windowStart: bigint;
    windowEnd: bigint;
    goalsBefore: bigint;
    status: MarketStatus;
    result: Outcome;
    pool: bigint;
    quantities: [bigint, bigint];
    prices: [bigint, bigint];
}
interface MatchMarketCreatedEvent {
    marketId: Hash;
    market: Address;
    homeTeam: string;
    awayTeam: string;
    kickoff: bigint;
    log: Log;
}
interface NextGoalMarketCreatedEvent {
    marketId: Hash;
    market: Address;
    parentMatchId: Hash;
    windowStart: bigint;
    windowEnd: bigint;
    log: Log;
}
interface BetPlacedEvent {
    bettor: Address;
    outcome: number;
    shares: bigint;
    cost: bigint;
    log: Log;
}
interface MarketResolvedEvent {
    result: Outcome;
    log: Log;
}
interface ResolutionInitiatedEvent {
    market: Address;
    homeReqId: bigint;
    awayReqId: bigint;
    log: Log;
}
interface PayoutSentEvent {
    bettor: Address;
    amount: bigint;
    log: Log;
}
interface ResolutionFailedEvent {
    requestId: bigint;
    status: ResponseStatus;
    log: Log;
}
interface EmergencyResolvedEvent {
    market: Address;
    result: Outcome;
    log: Log;
}
interface FinalWhistleConfig {
    rpcUrl: string;
    factoryAddress: Address;
    resolverAddress?: Address;
    privateKey?: `0x${string}`;
}
interface BetEstimate {
    cost: bigint;
    shares: bigint;
    priceAfter: bigint;
}

declare class FinalWhistleClient {
    readonly public: PublicClient;
    readonly wallet: WalletClient | null;
    readonly account: PrivateKeyAccount | null;
    readonly factoryAddress: Address;
    readonly resolverAddress: Address | null;
    constructor(config: FinalWhistleConfig);
    getMatchMarketAddress(marketId: Hash): Promise<Address>;
    getNextGoalMarkets(parentMatchId: Hash): Promise<Address[]>;
    getMatchMarket(address: Address): Promise<MatchMarketInfo>;
    getNextGoalMarket(address: Address): Promise<NextGoalMarketInfo>;
    estimateMatchBet(marketAddress: Address, outcome: 0 | 1 | 2, amount: bigint): Promise<BetEstimate>;
    betMatch(marketAddress: Address, outcome: 0 | 1 | 2, amount: bigint): Promise<Hash>;
    betNextGoal(marketAddress: Address, outcome: 0 | 1, amount: bigint): Promise<Hash>;
    payoutMatchBatch(marketAddress: Address, bettors: Address[]): Promise<Hash>;
    payoutNextGoalBatch(marketAddress: Address, bettors: Address[]): Promise<Hash>;
    getClaimableMatch(marketAddress: Address, account: Address): Promise<bigint>;
    getClaimableNextGoal(marketAddress: Address, account: Address): Promise<bigint>;
    claimMatch(marketAddress: Address): Promise<Hash>;
    claimNextGoal(marketAddress: Address): Promise<Hash>;
    initiateMatchResolution(marketAddress: Address, fixtureApiUrl: string): Promise<Hash>;
    initiateNextGoalResolution(marketAddress: Address, fixtureApiUrl: string, goalsBefore: bigint): Promise<Hash>;
    watchMatchMarketCreated(onEvent: (event: MatchMarketCreatedEvent) => void): () => void;
    watchNextGoalMarketCreated(onEvent: (event: NextGoalMarketCreatedEvent) => void): () => void;
    watchBetsPlaced(marketAddress: Address, abi: typeof MatchMarketAbi | typeof NextGoalMarketAbi, onEvent: (event: BetPlacedEvent) => void): () => void;
    watchMarketResolved(marketAddress: Address, abi: typeof MatchMarketAbi | typeof NextGoalMarketAbi, onEvent: (event: MarketResolvedEvent) => void): () => void;
    watchPayoutSent(marketAddress: Address, abi: typeof MatchMarketAbi | typeof NextGoalMarketAbi, onEvent: (event: PayoutSentEvent) => void): () => void;
    watchResolutionInitiated(onEvent: (event: ResolutionInitiatedEvent) => void): () => void;
    watchResolutionFailed(onEvent: (event: ResolutionFailedEvent) => void): () => void;
    watchEmergencyResolved(onEvent: (event: EmergencyResolvedEvent) => void): () => void;
    listMatchMarkets(fromBlock?: bigint): Promise<Address[]>;
    private _requireWallet;
    private _requireResolver;
}

declare const MarketFactoryAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "_resolver";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "createMatchMarket";
    readonly inputs: readonly [{
        readonly name: "homeTeam";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "awayTeam";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "kickoff";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "market";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "marketId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "defaultB";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getNextGoalMarkets";
    readonly inputs: readonly [{
        readonly name: "matchId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address[]";
        readonly internalType: "address[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "matchMarkets";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "nextGoalMarkets";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "owner";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "resolver";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "setDefaultB";
    readonly inputs: readonly [{
        readonly name: "_b";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setResolver";
    readonly inputs: readonly [{
        readonly name: "_resolver";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "spawnNextGoalMarket";
    readonly inputs: readonly [{
        readonly name: "parentMatchId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "windowStart";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "windowEnd";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "goalsBefore";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "market";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "marketId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "event";
    readonly name: "MatchMarketCreated";
    readonly inputs: readonly [{
        readonly name: "marketId";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "bytes32";
    }, {
        readonly name: "market";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "homeTeam";
        readonly type: "string";
        readonly indexed: false;
        readonly internalType: "string";
    }, {
        readonly name: "awayTeam";
        readonly type: "string";
        readonly indexed: false;
        readonly internalType: "string";
    }, {
        readonly name: "kickoff";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "NextGoalMarketCreated";
    readonly inputs: readonly [{
        readonly name: "marketId";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "bytes32";
    }, {
        readonly name: "market";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }, {
        readonly name: "parentMatchId";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "bytes32";
    }, {
        readonly name: "windowStart";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "windowEnd";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}];

declare const ResolverAgentAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [{
        readonly name: "_platform";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "_jsonApiAgentId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "_multisig";
        readonly type: "address[3]";
        readonly internalType: "address[3]";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "receive";
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "PER_AGENT_PRICE";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "PLATFORM_TESTNET";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "SUBCOMMITTEE";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "approveEmergencyResolution";
    readonly inputs: readonly [{
        readonly name: "market";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "outcome";
        readonly type: "uint8";
        readonly internalType: "enum Outcome";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "done";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "emergencyVotes";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "handleResponse";
    readonly inputs: readonly [{
        readonly name: "requestId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "responses";
        readonly type: "tuple[]";
        readonly internalType: "struct AgentResponse[]";
        readonly components: readonly [{
            readonly name: "validator";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "result";
            readonly type: "bytes";
            readonly internalType: "bytes";
        }, {
            readonly name: "status";
            readonly type: "uint8";
            readonly internalType: "enum ResponseStatus";
        }, {
            readonly name: "receipt";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "timestamp";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "executionCost";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "status";
        readonly type: "uint8";
        readonly internalType: "enum ResponseStatus";
    }, {
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct AgentRequest";
        readonly components: readonly [{
            readonly name: "id";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "requester";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "callbackAddress";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "callbackSelector";
            readonly type: "bytes4";
            readonly internalType: "bytes4";
        }, {
            readonly name: "subcommittee";
            readonly type: "address[]";
            readonly internalType: "address[]";
        }, {
            readonly name: "responses";
            readonly type: "tuple[]";
            readonly internalType: "struct AgentResponse[]";
            readonly components: readonly [{
                readonly name: "validator";
                readonly type: "address";
                readonly internalType: "address";
            }, {
                readonly name: "result";
                readonly type: "bytes";
                readonly internalType: "bytes";
            }, {
                readonly name: "status";
                readonly type: "uint8";
                readonly internalType: "enum ResponseStatus";
            }, {
                readonly name: "receipt";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "timestamp";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }, {
                readonly name: "executionCost";
                readonly type: "uint256";
                readonly internalType: "uint256";
            }];
        }, {
            readonly name: "responseCount";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "failureCount";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "threshold";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "createdAt";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "deadline";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "status";
            readonly type: "uint8";
            readonly internalType: "enum ResponseStatus";
        }, {
            readonly name: "consensusType";
            readonly type: "uint8";
            readonly internalType: "uint8";
        }, {
            readonly name: "remainingBudget";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "perAgentBudget";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "initiateMatchResolution";
    readonly inputs: readonly [{
        readonly name: "market";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "apiUrl";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "initiateNextGoalResolution";
    readonly inputs: readonly [{
        readonly name: "market";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "apiUrl";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "goalsBefore";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "jobs";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "market";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "isMatchMarket";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "isHomeRequest";
        readonly type: "bool";
        readonly internalType: "bool";
    }, {
        readonly name: "pairedId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "goalsBefore";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "jsonApiAgentId";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "multisig";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "owner";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "platform";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "contract IAgentRequester";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "received";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "requiredDeposit";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "closeMarket";
    readonly inputs: readonly [{
        readonly name: "market";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "setJsonApiAgentId";
    readonly inputs: readonly [{
        readonly name: "id";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "voted";
    readonly inputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "EmergencyResolved";
    readonly inputs: readonly [{
        readonly name: "market";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "result";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "enum Outcome";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ResolutionFailed";
    readonly inputs: readonly [{
        readonly name: "requestId";
        readonly type: "uint256";
        readonly indexed: true;
        readonly internalType: "uint256";
    }, {
        readonly name: "status";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "enum ResponseStatus";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ResolutionFulfilled";
    readonly inputs: readonly [{
        readonly name: "market";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "result";
        readonly type: "uint8";
        readonly indexed: false;
        readonly internalType: "enum Outcome";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "ResolutionInitiated";
    readonly inputs: readonly [{
        readonly name: "market";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "homeReqId";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "awayReqId";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}];

declare const SOMNIA_TESTNET_CHAIN_ID = 50312;
declare const somniaTestnet: {
    readonly id: 50312;
    readonly name: "Somnia Testnet";
    readonly nativeCurrency: {
        readonly name: "Somnia Test Token";
        readonly symbol: "STT";
        readonly decimals: 18;
    };
    readonly rpcUrls: {
        readonly default: {
            readonly http: readonly ["https://dream-rpc.somnia.network"];
        };
    };
    readonly blockExplorers: {
        readonly default: {
            readonly name: "Somnia Explorer";
            readonly url: "https://explorer.somnia.network";
        };
    };
    readonly testnet: true;
};
declare const AGENT_PLATFORM_TESTNET: "0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776";
declare const PER_AGENT_PRICE: bigint;
declare const SUBCOMMITTEE_SIZE = 3n;
declare const LMSR_SCALE: bigint;
declare const MATCH_OUTCOME_LABELS: Record<number, string>;
declare const GOAL_OUTCOME_LABELS: Record<number, string>;

declare function encodeFetchUint(url: string, selector: string, decimals?: number): Hex;
declare function encodeFetchString(url: string, selector: string): Hex;
declare function encodeFetchBool(url: string, selector: string): Hex;
declare function buildGoalPayloads(fixtureUrl: string): {
    home: Hex;
    away: Hex;
};

export { AGENT_PLATFORM_TESTNET, type BetEstimate, type BetPlacedEvent, type EmergencyResolvedEvent, FinalWhistleClient, type FinalWhistleConfig, GOAL_OUTCOME_LABELS, LMSR_SCALE, MATCH_OUTCOME_LABELS, MarketFactoryAbi, type MarketResolvedEvent, MarketStatus, MatchMarketAbi, type MatchMarketCreatedEvent, type MatchMarketInfo, NextGoalMarketAbi, type NextGoalMarketCreatedEvent, type NextGoalMarketInfo, Outcome, PER_AGENT_PRICE, type PayoutSentEvent, type ResolutionFailedEvent, type ResolutionInitiatedEvent, ResolverAgentAbi, ResponseStatus, SOMNIA_TESTNET_CHAIN_ID, SUBCOMMITTEE_SIZE, buildGoalPayloads, encodeFetchBool, encodeFetchString, encodeFetchUint, somniaTestnet };
