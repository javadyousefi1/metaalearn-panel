import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
  'ul', 'ol', 'li', 'a', 'span',
];
const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

/** Sanitizes rich-text (Quill) HTML before rendering with dangerouslySetInnerHTML. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Only http, https, mailto and tel URLs.
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):/i,
  });
}

/**
 * Sanitizes raw SVG markup (e.g. course club schedule icons) before rendering
 * with dangerouslySetInnerHTML. Keeps SVG shapes, drops scripts, event handlers
 * and foreign content.
 */
export function sanitizeSvg(svg: string | null | undefined): string {
  if (!svg) return '';
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['use', 'foreignObject', 'a', 'image', 'style'],
  });
}
