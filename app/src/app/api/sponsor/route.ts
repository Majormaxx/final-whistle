import { NextRequest, NextResponse } from 'next/server'
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  isAddress,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { somniaTestnet } from '@/lib/chain'

const DRIP        = parseEther('0.1')           // gas alone ~0.023 STT; 0.1 covers 3-4 bets
const MIN_BALANCE = parseEther('0.04')          // don't drip if they already have enough for a bet
const SPONSOR_KEY = process.env.SPONSOR_PRIVATE_KEY as `0x${string}`

// In-memory dedup — resets on server restart, fine for hackathon
const dripped = new Set<string>()

export async function POST(req: NextRequest) {
  const { address } = await req.json()

  if (!isAddress(address)) {
    return NextResponse.json({ error: 'invalid address' }, { status: 400 })
  }
  if (!SPONSOR_KEY) {
    return NextResponse.json({ error: 'sponsor not configured' }, { status: 503 })
  }
  if (dripped.has(address.toLowerCase())) {
    return NextResponse.json({ error: 'already dripped' }, { status: 429 })
  }

  const publicClient = createPublicClient({ chain: somniaTestnet, transport: http() })
  const balance = await publicClient.getBalance({ address })

  if (balance >= MIN_BALANCE) {
    return NextResponse.json({ skipped: true, balance: balance.toString() })
  }

  const account = privateKeyToAccount(SPONSOR_KEY)
  const walletClient = createWalletClient({ chain: somniaTestnet, transport: http(), account })

  const hash = await walletClient.sendTransaction({ to: address, value: DRIP })
  dripped.add(address.toLowerCase())

  return NextResponse.json({ hash, dripped: DRIP.toString() })
}
