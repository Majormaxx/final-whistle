export const ResolverAgentAbi = [
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
] as const
