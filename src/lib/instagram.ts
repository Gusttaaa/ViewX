import type {
  IGClipMedia,
  IGClipsResponse,
  IGUserResponse,
  Reel,
  Result,
} from '@/types/reel'

const IG_APP_ID = '936619743392459'
const BASE = 'https://www.instagram.com/api/v1'

const cache = new Map<string, { data: Reel[]; fetchedAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000

function buildHeaders(sessionId: string, csrfToken: string, dsUserId: string): HeadersInit {
  return {
    Cookie: `sessionid=${sessionId}; csrftoken=${csrfToken}; ds_user_id=${dsUserId}`,
    'X-IG-App-ID': IG_APP_ID,
    'X-CSRFToken': csrfToken,
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    Accept: '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    Referer: 'https://www.instagram.com/',
    'X-Requested-With': 'XMLHttpRequest',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    Connection: 'keep-alive',
  }
}

function parseClip(media: IGClipMedia): Reel {
  const crossPosted =
    media.has_shared_to_fb === 1 ||
    !!media.crosspost_metadata?.facebook_url ||
    (media.fb_user_tags?.in?.length ?? 0) > 0

  return {
    id: media.id,
    url: `https://www.instagram.com/reel/${media.code}/`,
    thumbnail: media.image_versions2.candidates[0]?.url ?? '',
    caption: media.caption?.text ?? '',
    publishedAt: new Date(media.taken_at * 1000).toISOString(),
    views: media.play_count ?? 0,
    likes: media.like_count ?? 0,
    comments: media.comment_count ?? 0,
    crossPostedToFacebook: crossPosted,
    facebookUrl: media.crosspost_metadata?.facebook_url ?? undefined,
  }
}

async function resolveUserId(
  username: string,
  headers: HeadersInit
): Promise<Result<{ userId: string; isPrivate: boolean }>> {
  let res: Response
  try {
    res = await fetch(
      `${BASE}/users/web_profile_info/?username=${encodeURIComponent(username)}`,
      { headers, cache: 'no-store', redirect: 'manual' }
    )
  } catch (err) {
    const msg = err instanceof Error
      ? `${err.message} | cause: ${String((err as NodeJS.ErrnoException).cause)}`
      : String(err)
    return { ok: false, error: { type: 'NETWORK_ERROR', message: msg } }
  }

  if (res.status >= 300 && res.status < 400) return { ok: false, error: { type: 'AUTH_FAILED' } }
  if (res.status === 404) return { ok: false, error: { type: 'USER_NOT_FOUND', username } }
  if (res.status === 401 || res.status === 403) return { ok: false, error: { type: 'AUTH_FAILED' } }
  if (res.status === 429) return { ok: false, error: { type: 'RATE_LIMITED' } }
  if (!res.ok) return { ok: false, error: { type: 'NETWORK_ERROR', message: `HTTP ${res.status}` } }

  const json: IGUserResponse = await res.json()
  if (!json?.data?.user) return { ok: false, error: { type: 'USER_NOT_FOUND', username } }

  return {
    ok: true,
    data: { userId: json.data.user.id, isPrivate: json.data.user.is_private },
  }
}

// Fetches one page from the clips endpoint. Returns null on any error.
async function fetchClipsPage(
  userId: string,
  maxId: string,
  headers: HeadersInit
): Promise<{ items: IGClipsResponse['items']; nextMaxId: string; hasMore: boolean } | null> {
  try {
    const body = new URLSearchParams({
      target_user_id: userId,
      page_size: '12',
      max_id: maxId,
    })
    const res = await fetch(`${BASE}/clips/user/`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      cache: 'no-store',
      redirect: 'manual',
    })
    if (!res.ok || res.status >= 300) return null
    const json: IGClipsResponse = await res.json()
    return {
      items:     json.items ?? [],
      nextMaxId: json.paging_info?.max_id ?? '',
      hasMore:   json.paging_info?.more_available ?? false,
    }
  } catch {
    return null
  }
}

async function fetchReelsForUser(
  username: string,
  userId: string,
  headers: HeadersInit
): Promise<Result<Reel[]>> {
  const collected: IGClipsResponse['items'] = []
  let maxId = ''

  // Paginate until we have 20 reels or run out of pages (max 5 requests)
  for (let page = 0; page < 5 && collected.length < 20; page++) {
    const result = await fetchClipsPage(userId, maxId, headers)

    if (!result) {
      // First page failed — return a real error; subsequent failures just stop paginating
      if (page === 0) {
        return { ok: false, error: { type: 'NETWORK_ERROR', message: 'clips fetch failed' } }
      }
      break
    }

    collected.push(...result.items)
    if (!result.hasMore || !result.nextMaxId) break
    maxId = result.nextMaxId
  }

  if (collected.length === 0) {
    return { ok: false, error: { type: 'NO_REELS', username } }
  }

  const reels = collected.slice(0, 20).map((item) => parseClip(item.media))
  return { ok: true, data: reels }
}

export async function fetchReels(username: string): Promise<Result<Reel[]>> {
  const sessionId = process.env.INSTAGRAM_SESSION_ID
  const csrfToken = process.env.INSTAGRAM_CSRF_TOKEN
  const dsUserId  = process.env.INSTAGRAM_DS_USER_ID
  if (!sessionId || !csrfToken || !dsUserId) {
    return { ok: false, error: { type: 'MISSING_ENV' } }
  }

  const cached = cache.get(username)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { ok: true, data: cached.data }
  }

  const headers = buildHeaders(sessionId, csrfToken, dsUserId)

  const userResult = await resolveUserId(username, headers)
  if (!userResult.ok) return userResult

  if (userResult.data.isPrivate) {
    return { ok: false, error: { type: 'PRIVATE_PROFILE', username } }
  }

  const reelsResult = await fetchReelsForUser(username, userResult.data.userId, headers)
  if (!reelsResult.ok) return reelsResult

  cache.set(username, { data: reelsResult.data, fetchedAt: Date.now() })
  return reelsResult
}
