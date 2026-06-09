import { NextResponse } from 'next/server'
import { getFixturesForDays } from '@/lib/fixtures'

export const revalidate = 60

export async function GET() {
  const fixtures = await getFixturesForDays(3, 60)
  return NextResponse.json({ fixtures })
}
