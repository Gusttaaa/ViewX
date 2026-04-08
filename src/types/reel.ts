// Public output type returned by the API
export interface Reel {
  id: string
  url: string
  thumbnail: string
  caption: string
  publishedAt: string // ISO 8601
  views: number
  likes: number
  comments: number
  crossPostedToFacebook: boolean
  facebookUrl?: string
}

// Typed error variants
export type InstagramError =
  | { type: 'MISSING_ENV' }
  | { type: 'USER_NOT_FOUND'; username: string }
  | { type: 'PRIVATE_PROFILE'; username: string }
  | { type: 'RATE_LIMITED' }
  | { type: 'AUTH_FAILED' }
  | { type: 'NO_REELS'; username: string }
  | { type: 'NETWORK_ERROR'; message: string }

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: InstagramError }

// Raw Instagram API shapes (internal to lib/instagram.ts)
export interface IGUserResponse {
  data: {
    user: {
      id: string
      username: string
      is_private: boolean
      full_name: string
    } | null
  }
}

// Shape returned by /api/v1/clips/user/ (current Reels endpoint)
export interface IGClipMedia {
  id: string
  code: string           // shortcode used in the reel URL
  taken_at: number
  play_count: number | null
  like_count: number | null
  comment_count: number | null
  caption: { text: string } | null
  image_versions2: {
    candidates: Array<{ url: string; width: number; height: number }>
  }
  has_shared_to_fb?: number
  crosspost_metadata?: {
    facebook_url?: string
  }
  fb_user_tags?: {
    in: unknown[]
  }
}

export interface IGClipsResponse {
  items: Array<{ media: IGClipMedia }>
  paging_info: {
    max_id: string
    more_available: boolean
  }
  status: string
}
