/**
 * Strip HTML tags from a string and collapse whitespace to plain text.
 * Regex-based, no dependencies.
 */
export function stripHtml(html: string): string {
  return html
    // Remove script/style blocks entirely (content + tags)
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    // Replace block-level tags with newlines for readability
    .replace(/<\/?(p|div|section|article|h[1-6]|li|tr|br)[^>]*>/gi, '\n')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Collapse multiple whitespace/newlines
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
