type MediaReference = {
  filename?: string | null
  url?: string | null
} | null | undefined

/** Resolve Payload's stored local upload path to its public Vercel Blob URL. */
export function publicMediaUrl(media: MediaReference): string | null {
  if (!media) return null
  const storedUrl = media.url || null
  if (storedUrl?.startsWith('http://') || storedUrl?.startsWith('https://')) return storedUrl

  const token = process.env.BLOB_READ_WRITE_TOKEN || ''
  const storeId = token.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1]
  if (storeId && media.filename) {
    return `https://${storeId.toLowerCase()}.public.blob.vercel-storage.com/${encodeURIComponent(media.filename)}`
  }

  return storedUrl
}
