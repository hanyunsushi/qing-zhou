export type UpstreamProvider = 'oci' | 'cloudflare'

export const defaultUpstreamOrder: readonly UpstreamProvider[] = ['oci', 'cloudflare']

export function normalizeUpstreamOrder(raw: unknown): UpstreamProvider[] {
  const values = Array.isArray(raw) ? raw : String(raw || '').split(',')
  const valid = values.filter((value): value is UpstreamProvider => value === 'oci' || value === 'cloudflare')
  return [...new Set([...valid, ...defaultUpstreamOrder])]
}
