import { NextRequest, NextResponse } from 'next/server'
import { fetchReels } from '@/lib/instagram'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('username')

  if (!raw || raw.trim() === '') {
    return NextResponse.json(
      { error: 'username parameter is required' },
      { status: 400 }
    )
  }

  // Sanitize: strip leading @, lowercase
  const username = raw.trim().toLowerCase().replace(/^@/, '')

  // Instagram usernames: alphanumeric, underscores, periods, max 30 chars
  if (!/^[a-z0-9._]{1,30}$/.test(username)) {
    return NextResponse.json(
      { error: 'Invalid username format' },
      { status: 400 }
    )
  }

  const result = await fetchReels(username)

  if (!result.ok) {
    switch (result.error.type) {
      case 'MISSING_ENV':
        return NextResponse.json(
          { error: 'Server misconfigured: INSTAGRAM_SESSION_ID is not set' },
          { status: 500 }
        )
      case 'USER_NOT_FOUND':
        return NextResponse.json(
          { error: `User @${username} not found` },
          { status: 404 }
        )
      case 'PRIVATE_PROFILE':
        return NextResponse.json(
          { error: `@${username} is a private account` },
          { status: 403 }
        )
      case 'RATE_LIMITED':
        return NextResponse.json(
          { error: 'Instagram rate limit reached. Try again in a few minutes.' },
          { status: 429 }
        )
      case 'AUTH_FAILED':
        return NextResponse.json(
          {
            error:
              'Instagram session expired or invalid. Update INSTAGRAM_SESSION_ID in .env and restart.',
          },
          { status: 401 }
        )
      case 'NO_REELS':
        return NextResponse.json(
          { reels: [], message: `@${username} has no Reels` },
          { status: 200 }
        )
      case 'NETWORK_ERROR':
        return NextResponse.json(
          { error: `Network error: ${result.error.message}` },
          { status: 502 }
        )
      default:
        return NextResponse.json(
          { error: 'Unexpected error occurred' },
          { status: 500 }
        )
    }
  }

  return NextResponse.json({ reels: result.data })
}
