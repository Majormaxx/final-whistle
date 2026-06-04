export const MarketFactoryAbi = [
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
] as const
