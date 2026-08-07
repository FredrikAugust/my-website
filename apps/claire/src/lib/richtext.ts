/**
 * Extract plain text from a Lexical richText JSON tree.
 */
export function extractPlainText(data: unknown, maxLength = 150): string {
  if (!data || typeof data !== 'object') return ''

  const root = (data as Record<string, unknown>).root
  if (!root) return ''

  const parts: string[] = []

  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return
    const n = node as Record<string, unknown>
    if (typeof n.text === 'string') {
      parts.push(n.text)
    }
    if (Array.isArray(n.children)) {
      for (const child of n.children) {
        walk(child)
      }
    }
  }

  walk(root)
  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}
