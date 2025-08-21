import sanitizeHtml from 'sanitize-html';

const SANITIZE_CONFIG = {
  allowedTags: ['p', 'br', 'b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'a'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  // Ensure links open safely and strip dangerous schemes
  transformTags: {
    a: (tagName: string, attribs: any) => {
      const href = attribs.href || '';
      // strip javascript: or data: URIs by converting to plain span
      if (/^\s*(javascript|data):/i.test(href)) {
        return { tagName: 'span', attribs: {} };
      }
      return {
        tagName: 'a',
        attribs: {
          href,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      };
    },
  },
};

export function sanitize(input: string | null | undefined): string | null {
  if (input === null || input === undefined) return null;
  return sanitizeHtml(String(input), SANITIZE_CONFIG);
}

// Accepts plain text or HTML. If plain text, convert newlines into <p>/<br/> and then sanitize.
export function sanitizeFromText(input: string | null | undefined): string | null {
  if (input === null || input === undefined) return null;
  const raw = String(input);
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(raw);
  if (looksLikeHtml) {
    return sanitize(raw);
  }
  const normalized = raw.replace(/\r\n/g, '\n').trim();
  if (!normalized) return null;
  const escaped = normalized.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const paragraphs = escaped.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`).join('');
  return sanitize(paragraphs);
}

export default sanitize;
