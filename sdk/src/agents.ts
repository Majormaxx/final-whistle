import { encodeFunctionData, type Hex } from 'viem'

// ABI fragments for the Somnia JSON API Request agent's fetch functions.
// Payload is encoded with encodeFunctionData and passed to platform.createRequest().
const fetchUintAbi = [
  {
    type: 'function',
    name: 'fetchUint',
    inputs: [
      { name: 'url',      type: 'string' },
      { name: 'selector', type: 'string' },
      { name: 'decimals', type: 'uint8'  },
    ],
    outputs: [{ name: 'result', type: 'uint256' }],
  },
] as const

const fetchStringAbi = [
  {
    type: 'function',
    name: 'fetchString',
    inputs: [
      { name: 'url',      type: 'string' },
      { name: 'selector', type: 'string' },
    ],
    outputs: [{ name: 'result', type: 'string' }],
  },
] as const

const fetchBoolAbi = [
  {
    type: 'function',
    name: 'fetchBool',
    inputs: [
      { name: 'url',      type: 'string' },
      { name: 'selector', type: 'string' },
    ],
    outputs: [{ name: 'result', type: 'bool' }],
  },
] as const

// Encode a fetchUint payload for createRequest.
// decimals: scaling factor — 0 for integer counts like goals.
export function encodeFetchUint(url: string, selector: string, decimals = 0): Hex {
  return encodeFunctionData({
    abi: fetchUintAbi,
    functionName: 'fetchUint',
    args: [url, selector, decimals],
  })
}

export function encodeFetchString(url: string, selector: string): Hex {
  return encodeFunctionData({
    abi: fetchStringAbi,
    functionName: 'fetchString',
    args: [url, selector],
  })
}

export function encodeFetchBool(url: string, selector: string): Hex {
  return encodeFunctionData({
    abi: fetchBoolAbi,
    functionName: 'fetchBool',
    args: [url, selector],
  })
}

// Build the two payloads used for match/next-goal resolution.
export function buildGoalPayloads(fixtureUrl: string): { home: Hex; away: Hex } {
  return {
    home: encodeFetchUint(fixtureUrl, 'response.0.goals.home', 0),
    away: encodeFetchUint(fixtureUrl, 'response.0.goals.away', 0),
  }
}
