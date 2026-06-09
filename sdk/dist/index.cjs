"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AGENT_PLATFORM_TESTNET: () => AGENT_PLATFORM_TESTNET,
  FinalWhistleClient: () => FinalWhistleClient,
  GOAL_OUTCOME_LABELS: () => GOAL_OUTCOME_LABELS,
  LMSR_SCALE: () => LMSR_SCALE,
  MATCH_OUTCOME_LABELS: () => MATCH_OUTCOME_LABELS,
  MarketFactoryAbi: () => MarketFactoryAbi,
  MarketStatus: () => MarketStatus,
  MatchMarketAbi: () => MatchMarketAbi,
  NextGoalMarketAbi: () => NextGoalMarketAbi,
  Outcome: () => Outcome,
  PER_AGENT_PRICE: () => PER_AGENT_PRICE,
  ResolverAgentAbi: () => ResolverAgentAbi,
  ResponseStatus: () => ResponseStatus,
  SOMNIA_TESTNET_CHAIN_ID: () => SOMNIA_TESTNET_CHAIN_ID,
  SUBCOMMITTEE_SIZE: () => SUBCOMMITTEE_SIZE,
  buildGoalPayloads: () => buildGoalPayloads,
  encodeFetchBool: () => encodeFetchBool,
  encodeFetchString: () => encodeFetchString,
  encodeFetchUint: () => encodeFetchUint,
  somniaTestnet: () => somniaTestnet
});
module.exports = __toCommonJS(index_exports);

// src/client.ts
var import_viem = require("viem");
var import_accounts = require("viem/accounts");

// src/abis/MarketFactory.ts
var MarketFactoryAbi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_resolver",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createMatchMarket",
    "inputs": [
      {
        "name": "homeTeam",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "awayTeam",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "kickoff",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "market",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "marketId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "defaultB",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getNextGoalMarkets",
    "inputs": [
      {
        "name": "matchId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "matchMarkets",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "nextGoalMarkets",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "resolver",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setDefaultB",
    "inputs": [
      {
        "name": "_b",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setResolver",
    "inputs": [
      {
        "name": "_resolver",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "spawnNextGoalMarket",
    "inputs": [
      {
        "name": "parentMatchId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "windowStart",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "windowEnd",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "goalsBefore",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "market",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "marketId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "MatchMarketCreated",
    "inputs": [
      {
        "name": "marketId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "market",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "homeTeam",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "awayTeam",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "kickoff",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "NextGoalMarketCreated",
    "inputs": [
      {
        "name": "marketId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "market",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "parentMatchId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "windowStart",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "windowEnd",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
];

// src/abis/MatchMarket.ts
var MatchMarketAbi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_marketId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_resolver",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_homeTeam",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_awayTeam",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_kickoff",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_b",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "receive",
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "PAYOUT_CAP",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "awayTeam",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "b",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "bet",
    "inputs": [
      {
        "name": "outcome",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "claim",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "close",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "factory",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPrice",
    "inputs": [
      {
        "name": "outcome",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getQuantities",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256[3]",
        "internalType": "uint256[3]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "homeTeam",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isParticipant",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "kickoff",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "marketId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "participantCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "payoutBatch",
    "inputs": [
      {
        "name": "bettors",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "pool",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "quantities",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "resolve",
    "inputs": [
      {
        "name": "outcome",
        "type": "uint8",
        "internalType": "enum Outcome"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "resolver",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "result",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "enum Outcome"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "shares",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "status",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "enum MarketStatus"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "BetPlaced",
    "inputs": [
      {
        "name": "bettor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "outcome",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "shares",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "cost",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketResolved",
    "inputs": [
      {
        "name": "result",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum Outcome"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PayoutSent",
    "inputs": [
      {
        "name": "bettor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
];

// src/abis/NextGoalMarket.ts
var NextGoalMarketAbi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_marketId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_resolver",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_parentMatchId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_windowStart",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_windowEnd",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_goalsBefore",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_b",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "receive",
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "b",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "bet",
    "inputs": [
      {
        "name": "outcome",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "claim",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "close",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "factory",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPrice",
    "inputs": [
      {
        "name": "outcome",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "goalsBefore",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "marketId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "parentMatchId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "payoutBatch",
    "inputs": [
      {
        "name": "bettors",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "pool",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "quantities",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "resolve",
    "inputs": [
      {
        "name": "outcome",
        "type": "uint8",
        "internalType": "enum Outcome"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "resolver",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "result",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "enum Outcome"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "shares",
    "inputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "status",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "enum MarketStatus"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "windowEnd",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "windowStart",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "BetPlaced",
    "inputs": [
      {
        "name": "bettor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "outcome",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "shares",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "cost",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketResolved",
    "inputs": [
      {
        "name": "result",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum Outcome"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PayoutSent",
    "inputs": [
      {
        "name": "bettor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
];

// src/abis/ResolverAgent.ts
var ResolverAgentAbi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_platform",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_jsonApiAgentId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_multisig",
        "type": "address[3]",
        "internalType": "address[3]"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "receive",
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "PER_AGENT_PRICE",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "PLATFORM_TESTNET",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "SUBCOMMITTEE",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approveEmergencyResolution",
    "inputs": [
      {
        "name": "market",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "outcome",
        "type": "uint8",
        "internalType": "enum Outcome"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "done",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "emergencyVotes",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "handleResponse",
    "inputs": [
      {
        "name": "requestId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "responses",
        "type": "tuple[]",
        "internalType": "struct AgentResponse[]",
        "components": [
          {
            "name": "validator",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "result",
            "type": "bytes",
            "internalType": "bytes"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum ResponseStatus"
          },
          {
            "name": "receipt",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "timestamp",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "executionCost",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      },
      {
        "name": "status",
        "type": "uint8",
        "internalType": "enum ResponseStatus"
      },
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct AgentRequest",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "requester",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "callbackAddress",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "callbackSelector",
            "type": "bytes4",
            "internalType": "bytes4"
          },
          {
            "name": "subcommittee",
            "type": "address[]",
            "internalType": "address[]"
          },
          {
            "name": "responses",
            "type": "tuple[]",
            "internalType": "struct AgentResponse[]",
            "components": [
              {
                "name": "validator",
                "type": "address",
                "internalType": "address"
              },
              {
                "name": "result",
                "type": "bytes",
                "internalType": "bytes"
              },
              {
                "name": "status",
                "type": "uint8",
                "internalType": "enum ResponseStatus"
              },
              {
                "name": "receipt",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "timestamp",
                "type": "uint256",
                "internalType": "uint256"
              },
              {
                "name": "executionCost",
                "type": "uint256",
                "internalType": "uint256"
              }
            ]
          },
          {
            "name": "responseCount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "failureCount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "threshold",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "createdAt",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "deadline",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "enum ResponseStatus"
          },
          {
            "name": "consensusType",
            "type": "uint8",
            "internalType": "uint8"
          },
          {
            "name": "remainingBudget",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "perAgentBudget",
            "type": "uint256",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "initiateMatchResolution",
    "inputs": [
      {
        "name": "market",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "apiUrl",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "initiateNextGoalResolution",
    "inputs": [
      {
        "name": "market",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "apiUrl",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "goalsBefore",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "jobs",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "market",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "isMatchMarket",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "isHomeRequest",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "pairedId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "goalsBefore",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "jsonApiAgentId",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "multisig",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "platform",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IAgentRequester"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "received",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "requiredDeposit",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "closeMarket",
    "inputs": [{ "name": "market", "type": "address", "internalType": "address" }],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setJsonApiAgentId",
    "inputs": [
      {
        "name": "id",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "voted",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "EmergencyResolved",
    "inputs": [
      {
        "name": "market",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "result",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum Outcome"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ResolutionFailed",
    "inputs": [
      {
        "name": "requestId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "status",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum ResponseStatus"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ResolutionFulfilled",
    "inputs": [
      {
        "name": "market",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "result",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum Outcome"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ResolutionInitiated",
    "inputs": [
      {
        "name": "market",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "homeReqId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "awayReqId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
];

// src/constants.ts
var SOMNIA_TESTNET_CHAIN_ID = 50312;
var somniaTestnet = {
  id: SOMNIA_TESTNET_CHAIN_ID,
  name: "Somnia Testnet",
  nativeCurrency: { name: "Somnia Test Token", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://dream-rpc.somnia.network"] }
  },
  blockExplorers: {
    default: { name: "Somnia Explorer", url: "https://explorer.somnia.network" }
  },
  testnet: true
};
var AGENT_PLATFORM_TESTNET = "0x037Bb9C718F3f7fe5eCBDB0b600D607b52706776";
var PER_AGENT_PRICE = 3n * 10n ** 16n;
var SUBCOMMITTEE_SIZE = 3n;
var LMSR_SCALE = 10n ** 18n;
var MATCH_OUTCOME_LABELS = {
  1: "Home",
  2: "Draw",
  3: "Away"
};
var GOAL_OUTCOME_LABELS = {
  4: "Yes",
  5: "No"
};

// src/types.ts
var MarketStatus = /* @__PURE__ */ ((MarketStatus2) => {
  MarketStatus2[MarketStatus2["Open"] = 0] = "Open";
  MarketStatus2[MarketStatus2["Closed"] = 1] = "Closed";
  MarketStatus2[MarketStatus2["Resolved"] = 2] = "Resolved";
  MarketStatus2[MarketStatus2["Cancelled"] = 3] = "Cancelled";
  return MarketStatus2;
})(MarketStatus || {});
var Outcome = /* @__PURE__ */ ((Outcome2) => {
  Outcome2[Outcome2["None"] = 0] = "None";
  Outcome2[Outcome2["Home"] = 1] = "Home";
  Outcome2[Outcome2["Draw"] = 2] = "Draw";
  Outcome2[Outcome2["Away"] = 3] = "Away";
  Outcome2[Outcome2["Yes"] = 4] = "Yes";
  Outcome2[Outcome2["No"] = 5] = "No";
  return Outcome2;
})(Outcome || {});
var ResponseStatus = /* @__PURE__ */ ((ResponseStatus3) => {
  ResponseStatus3[ResponseStatus3["None"] = 0] = "None";
  ResponseStatus3[ResponseStatus3["Pending"] = 1] = "Pending";
  ResponseStatus3[ResponseStatus3["Success"] = 2] = "Success";
  ResponseStatus3[ResponseStatus3["Failed"] = 3] = "Failed";
  ResponseStatus3[ResponseStatus3["TimedOut"] = 4] = "TimedOut";
  return ResponseStatus3;
})(ResponseStatus || {});

// src/client.ts
var FinalWhistleClient = class {
  public;
  wallet;
  account;
  factoryAddress;
  resolverAddress;
  constructor(config) {
    this.public = (0, import_viem.createPublicClient)({
      chain: somniaTestnet,
      transport: (0, import_viem.http)(config.rpcUrl)
    });
    if (config.privateKey) {
      this.account = (0, import_accounts.privateKeyToAccount)(config.privateKey);
      this.wallet = (0, import_viem.createWalletClient)({
        chain: somniaTestnet,
        transport: (0, import_viem.http)(config.rpcUrl),
        account: this.account
      });
    } else {
      this.account = null;
      this.wallet = null;
    }
    this.factoryAddress = config.factoryAddress;
    this.resolverAddress = config.resolverAddress ?? null;
  }
  // ── factory reads ──────────────────────────────────────────────────────
  async getMatchMarketAddress(marketId) {
    return this.public.readContract({
      address: this.factoryAddress,
      abi: MarketFactoryAbi,
      functionName: "matchMarkets",
      args: [marketId]
    });
  }
  async getNextGoalMarkets(parentMatchId) {
    return this.public.readContract({
      address: this.factoryAddress,
      abi: MarketFactoryAbi,
      functionName: "getNextGoalMarkets",
      args: [parentMatchId]
    });
  }
  // ── match market reads ─────────────────────────────────────────────────
  async getMatchMarket(address) {
    const [homeTeam, awayTeam, kickoff, status, result, pool, quantities, marketId] = await Promise.all([
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: "homeTeam" }),
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: "awayTeam" }),
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: "kickoff" }),
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: "status" }),
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: "result" }),
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: "pool" }),
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: "getQuantities" }),
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: "marketId" })
    ]);
    const [p0, p1, p2] = await Promise.all([
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: "getPrice", args: [0] }),
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: "getPrice", args: [1] }),
      this.public.readContract({ address, abi: MatchMarketAbi, functionName: "getPrice", args: [2] })
    ]);
    return {
      address,
      marketId,
      homeTeam,
      awayTeam,
      kickoff,
      status: Number(status),
      result: Number(result),
      pool,
      quantities,
      prices: [p0, p1, p2]
    };
  }
  // ── next goal market reads ─────────────────────────────────────────────
  async getNextGoalMarket(address) {
    const [parentMatchId, windowStart, windowEnd, goalsBefore, status, result, pool, marketId] = await Promise.all([
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: "parentMatchId" }),
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: "windowStart" }),
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: "windowEnd" }),
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: "goalsBefore" }),
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: "status" }),
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: "result" }),
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: "pool" }),
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: "marketId" })
    ]);
    const [q0, q1, p0, p1] = await Promise.all([
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: "quantities", args: [0n] }),
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: "quantities", args: [1n] }),
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: "getPrice", args: [0] }),
      this.public.readContract({ address, abi: NextGoalMarketAbi, functionName: "getPrice", args: [1] })
    ]);
    return {
      address,
      marketId,
      parentMatchId,
      windowStart,
      windowEnd,
      goalsBefore,
      status: Number(status),
      result: Number(result),
      pool,
      quantities: [q0, q1],
      prices: [p0, p1]
    };
  }
  // ── bet helpers ────────────────────────────────────────────────────────
  // Estimate cost of buying `amount` worth of shares on a MatchMarket outcome.
  // Uses current LMSR price as a first-order approximation. The contract is authoritative.
  async estimateMatchBet(marketAddress, outcome, amount) {
    const [priceNow, priceAfter] = await Promise.all([
      this.public.readContract({
        address: marketAddress,
        abi: MatchMarketAbi,
        functionName: "getPrice",
        args: [outcome]
      }),
      // price after is approximate since we can't call the LMSR lib directly off-chain
      this.public.readContract({
        address: marketAddress,
        abi: MatchMarketAbi,
        functionName: "getPrice",
        args: [outcome]
      })
    ]);
    const cost = amount * priceNow / LMSR_SCALE;
    return { cost, shares: amount, priceAfter };
  }
  // Place a bet on a MatchMarket. outcome: 0=HOME, 1=DRAW, 2=AWAY
  async betMatch(marketAddress, outcome, amount) {
    this._requireWallet();
    return this.wallet.writeContract({
      account: this.account,
      chain: somniaTestnet,
      address: marketAddress,
      abi: MatchMarketAbi,
      functionName: "bet",
      args: [outcome],
      value: amount
    });
  }
  // Place a bet on a NextGoalMarket. outcome: 0=YES, 1=NO
  async betNextGoal(marketAddress, outcome, amount) {
    this._requireWallet();
    return this.wallet.writeContract({
      account: this.account,
      chain: somniaTestnet,
      address: marketAddress,
      abi: NextGoalMarketAbi,
      functionName: "bet",
      args: [outcome],
      value: amount
    });
  }
  // ── payout ─────────────────────────────────────────────────────────────
  async payoutMatchBatch(marketAddress, bettors) {
    this._requireWallet();
    return this.wallet.writeContract({
      account: this.account,
      chain: somniaTestnet,
      address: marketAddress,
      abi: MatchMarketAbi,
      functionName: "payoutBatch",
      args: [bettors]
    });
  }
  async payoutNextGoalBatch(marketAddress, bettors) {
    this._requireWallet();
    return this.wallet.writeContract({
      account: this.account,
      chain: somniaTestnet,
      address: marketAddress,
      abi: NextGoalMarketAbi,
      functionName: "payoutBatch",
      args: [bettors]
    });
  }
  // How much `account` would receive by calling claim() right now — 0n if the
  // market isn't resolved yet, they didn't back the winning outcome, or they
  // (or a payoutBatch run) already claimed and zeroed their shares. Mirrors
  // the contract's own payout math read-only, since neither market exposes a
  // "previewClaim" view — this is the only way to show the amount in the UI
  // before the user spends gas finding out.
  async getClaimableMatch(marketAddress, account) {
    const [status, result, pool] = await Promise.all([
      this.public.readContract({ address: marketAddress, abi: MatchMarketAbi, functionName: "status" }),
      this.public.readContract({ address: marketAddress, abi: MatchMarketAbi, functionName: "result" }),
      this.public.readContract({ address: marketAddress, abi: MatchMarketAbi, functionName: "pool" })
    ]);
    if (Number(status) !== 2 /* Resolved */) return 0n;
    const winIdx = Number(result) - 1 /* Home */;
    if (winIdx < 0 || winIdx > 2) return 0n;
    const [winShares, totalWinShares] = await Promise.all([
      this.public.readContract({ address: marketAddress, abi: MatchMarketAbi, functionName: "shares", args: [account, BigInt(winIdx)] }),
      this.public.readContract({ address: marketAddress, abi: MatchMarketAbi, functionName: "quantities", args: [BigInt(winIdx)] })
    ]);
    if (winShares === 0n || totalWinShares === 0n) return 0n;
    return pool * winShares / totalWinShares;
  }
  // Same as getClaimableMatch but for the binary YES/NO shape of NextGoalMarket.
  async getClaimableNextGoal(marketAddress, account) {
    const [status, result, pool] = await Promise.all([
      this.public.readContract({ address: marketAddress, abi: NextGoalMarketAbi, functionName: "status" }),
      this.public.readContract({ address: marketAddress, abi: NextGoalMarketAbi, functionName: "result" }),
      this.public.readContract({ address: marketAddress, abi: NextGoalMarketAbi, functionName: "pool" })
    ]);
    if (Number(status) !== 2 /* Resolved */) return 0n;
    const winIdx = Number(result) === 4 /* Yes */ ? 0 : Number(result) === 5 /* No */ ? 1 : -1;
    if (winIdx < 0) return 0n;
    const [winShares, totalWinShares] = await Promise.all([
      this.public.readContract({ address: marketAddress, abi: NextGoalMarketAbi, functionName: "shares", args: [account, BigInt(winIdx)] }),
      this.public.readContract({ address: marketAddress, abi: NextGoalMarketAbi, functionName: "quantities", args: [BigInt(winIdx)] })
    ]);
    if (winShares === 0n || totalWinShares === 0n) return 0n;
    return pool * winShares / totalWinShares;
  }
  async claimMatch(marketAddress) {
    this._requireWallet();
    return this.wallet.writeContract({
      account: this.account,
      chain: somniaTestnet,
      address: marketAddress,
      abi: MatchMarketAbi,
      functionName: "claim"
    });
  }
  async claimNextGoal(marketAddress) {
    this._requireWallet();
    return this.wallet.writeContract({
      account: this.account,
      chain: somniaTestnet,
      address: marketAddress,
      abi: NextGoalMarketAbi,
      functionName: "claim"
    });
  }
  // ── resolution ─────────────────────────────────────────────────────────
  async initiateMatchResolution(marketAddress, fixtureApiUrl) {
    this._requireWallet();
    this._requireResolver();
    const deposit = await this.public.readContract({
      address: this.resolverAddress,
      abi: ResolverAgentAbi,
      functionName: "requiredDeposit"
    });
    return this.wallet.writeContract({
      account: this.account,
      chain: somniaTestnet,
      address: this.resolverAddress,
      abi: ResolverAgentAbi,
      functionName: "initiateMatchResolution",
      args: [marketAddress, fixtureApiUrl],
      value: deposit * 2n
    });
  }
  async initiateNextGoalResolution(marketAddress, fixtureApiUrl, goalsBefore) {
    this._requireWallet();
    this._requireResolver();
    const deposit = await this.public.readContract({
      address: this.resolverAddress,
      abi: ResolverAgentAbi,
      functionName: "requiredDeposit"
    });
    return this.wallet.writeContract({
      account: this.account,
      chain: somniaTestnet,
      address: this.resolverAddress,
      abi: ResolverAgentAbi,
      functionName: "initiateNextGoalResolution",
      args: [marketAddress, fixtureApiUrl, goalsBefore],
      value: deposit * 2n
    });
  }
  // ── event subscriptions ────────────────────────────────────────────────
  watchMatchMarketCreated(onEvent) {
    return this.public.watchContractEvent({
      address: this.factoryAddress,
      abi: MarketFactoryAbi,
      eventName: "MatchMarketCreated",
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args;
          onEvent({
            marketId: args.marketId,
            market: args.market,
            homeTeam: args.homeTeam,
            awayTeam: args.awayTeam,
            kickoff: args.kickoff,
            log
          });
        }
      }
    });
  }
  watchNextGoalMarketCreated(onEvent) {
    return this.public.watchContractEvent({
      address: this.factoryAddress,
      abi: MarketFactoryAbi,
      eventName: "NextGoalMarketCreated",
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args;
          onEvent({
            marketId: args.marketId,
            market: args.market,
            parentMatchId: args.parentMatchId,
            windowStart: args.windowStart,
            windowEnd: args.windowEnd,
            log
          });
        }
      }
    });
  }
  watchBetsPlaced(marketAddress, abi, onEvent) {
    return this.public.watchContractEvent({
      address: marketAddress,
      abi,
      eventName: "BetPlaced",
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args;
          onEvent({
            bettor: args.bettor,
            outcome: Number(args.outcome),
            shares: args.shares,
            cost: args.cost,
            log
          });
        }
      }
    });
  }
  watchMarketResolved(marketAddress, abi, onEvent) {
    return this.public.watchContractEvent({
      address: marketAddress,
      abi,
      eventName: "MarketResolved",
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args;
          onEvent({ result: Number(args.result), log });
        }
      }
    });
  }
  watchPayoutSent(marketAddress, abi, onEvent) {
    return this.public.watchContractEvent({
      address: marketAddress,
      abi,
      eventName: "PayoutSent",
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args;
          onEvent({ bettor: args.bettor, amount: args.amount, log });
        }
      }
    });
  }
  // Resolver fires this the moment it deposits and asks the agent platform to
  // read a score — the earliest on-chain signal that a settlement is in flight.
  watchResolutionInitiated(onEvent) {
    this._requireResolver();
    return this.public.watchContractEvent({
      address: this.resolverAddress,
      abi: ResolverAgentAbi,
      eventName: "ResolutionInitiated",
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args;
          onEvent({
            market: args.market,
            homeReqId: args.homeReqId,
            awayReqId: args.awayReqId,
            log
          });
        }
      }
    });
  }
  // Fires when an agent platform response comes back as anything other than
  // success — the moment the safety net starts paying attention.
  watchResolutionFailed(onEvent) {
    this._requireResolver();
    return this.public.watchContractEvent({
      address: this.resolverAddress,
      abi: ResolverAgentAbi,
      eventName: "ResolutionFailed",
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args;
          onEvent({
            requestId: args.requestId,
            status: Number(args.status),
            log
          });
        }
      }
    });
  }
  // Fires when the 2-of-3 multisig steps in to settle a market the agent
  // platform couldn't — the on-chain proof that funds are never stuck.
  watchEmergencyResolved(onEvent) {
    this._requireResolver();
    return this.public.watchContractEvent({
      address: this.resolverAddress,
      abi: ResolverAgentAbi,
      eventName: "EmergencyResolved",
      onLogs: (logs) => {
        for (const log of logs) {
          const args = log.args;
          onEvent({
            market: args.market,
            result: Number(args.result),
            log
          });
        }
      }
    });
  }
  // ── historical event fetch ─────────────────────────────────────────────
  async listMatchMarkets(fromBlock = 0n) {
    const logs = await this.public.getLogs({
      address: this.factoryAddress,
      fromBlock,
      toBlock: "latest"
    });
    const parsed = (0, import_viem.parseEventLogs)({
      abi: MarketFactoryAbi,
      logs,
      eventName: "MatchMarketCreated"
    });
    return parsed.map((e) => e.args.market);
  }
  // ── internal ──────────────────────────────────────────────────────────
  _requireWallet() {
    if (!this.wallet || !this.account) throw new Error("No private key \u2014 read-only client");
  }
  _requireResolver() {
    if (!this.resolverAddress) throw new Error("No resolverAddress in config");
  }
};

// src/agents.ts
var import_viem2 = require("viem");
var fetchUintAbi = [
  {
    type: "function",
    name: "fetchUint",
    inputs: [
      { name: "url", type: "string" },
      { name: "selector", type: "string" },
      { name: "decimals", type: "uint8" }
    ],
    outputs: [{ name: "result", type: "uint256" }]
  }
];
var fetchStringAbi = [
  {
    type: "function",
    name: "fetchString",
    inputs: [
      { name: "url", type: "string" },
      { name: "selector", type: "string" }
    ],
    outputs: [{ name: "result", type: "string" }]
  }
];
var fetchBoolAbi = [
  {
    type: "function",
    name: "fetchBool",
    inputs: [
      { name: "url", type: "string" },
      { name: "selector", type: "string" }
    ],
    outputs: [{ name: "result", type: "bool" }]
  }
];
function encodeFetchUint(url, selector, decimals = 0) {
  return (0, import_viem2.encodeFunctionData)({
    abi: fetchUintAbi,
    functionName: "fetchUint",
    args: [url, selector, decimals]
  });
}
function encodeFetchString(url, selector) {
  return (0, import_viem2.encodeFunctionData)({
    abi: fetchStringAbi,
    functionName: "fetchString",
    args: [url, selector]
  });
}
function encodeFetchBool(url, selector) {
  return (0, import_viem2.encodeFunctionData)({
    abi: fetchBoolAbi,
    functionName: "fetchBool",
    args: [url, selector]
  });
}
function buildGoalPayloads(fixtureUrl) {
  return {
    home: encodeFetchUint(fixtureUrl, "response.0.goals.home", 0),
    away: encodeFetchUint(fixtureUrl, "response.0.goals.away", 0)
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AGENT_PLATFORM_TESTNET,
  FinalWhistleClient,
  GOAL_OUTCOME_LABELS,
  LMSR_SCALE,
  MATCH_OUTCOME_LABELS,
  MarketFactoryAbi,
  MarketStatus,
  MatchMarketAbi,
  NextGoalMarketAbi,
  Outcome,
  PER_AGENT_PRICE,
  ResolverAgentAbi,
  ResponseStatus,
  SOMNIA_TESTNET_CHAIN_ID,
  SUBCOMMITTEE_SIZE,
  buildGoalPayloads,
  encodeFetchBool,
  encodeFetchString,
  encodeFetchUint,
  somniaTestnet
});
//# sourceMappingURL=index.cjs.map