import { Pipe, PipeTransform } from '@angular/core';

/**
 * Minimal, safe Markdown for chatbot replies.
 *
 * Everything is HTML-escaped FIRST, so raw HTML in a reply (e.g. `<img onerror=...>`) is shown as
 * text and can never execute. Only this small subset is then turned into markup:
 *   - bullet lists   (`* item`, `- item`, `• item`)
 *   - numbered lists (`1. item`, `1) item`)
 *   - **bold** / __bold__, *italic* / _italic_, `inline code`
 *   - headings (`# Title` … `###### Title`) rendered as bold lines
 *   - line breaks
 * Links and images are intentionally not supported (shown as plain text).
 * Angular's [innerHTML] sanitizer runs on the result as a second layer of defence.
 */
export function renderChatMarkdown(source: string): string {
  if (!source) return '';

  const lines = escapeHtml(source.replace(/\r\n?/g, '\n')).split('\n');
  const out: string[] = [];
  let list: 'ul' | 'ol' | null = null;
  let pendingBreak = false; // a <br> is owed before the next inline line

  const closeList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
      pendingBreak = false; // lists are blocks: no extra break needed after them
    }
  };

  for (const rawLine of lines) {
    const bullet = rawLine.match(/^\s*(?:[*\-+]|•)\s+(.*)$/);
    const numbered = rawLine.match(/^\s*\d{1,3}[.)]\s+(.*)$/);
    const heading = rawLine.match(/^\s*#{1,6}\s+(.*)$/);

    if (bullet || numbered) {
      const type = bullet ? 'ul' : 'ol';
      if (list !== type) {
        closeList();
        if (out[out.length - 1] === '<br>') out.pop(); // the list's own margin is the gap
        out.push(`<${type}>`);
        list = type;
      }
      out.push(`<li>${renderInline((bullet || numbered)![1])}</li>`);
      continue;
    }

    closeList();

    if (!rawLine.trim()) {
      // blank line: paragraph gap (collapse runs of blank lines)
      const last = out[out.length - 1];
      if (out.length && last !== '<br>' && last !== '</ul>' && last !== '</ol>') {
        out.push('<br>');
      }
      pendingBreak = false;
      continue;
    }

    if (pendingBreak) out.push('<br>');
    out.push(heading ? `<strong>${renderInline(heading[1])}</strong>` : renderInline(rawLine));
    pendingBreak = true;
  }
  closeList();

  // No leading/trailing breaks
  while (out[0] === '<br>') out.shift();
  while (out[out.length - 1] === '<br>') out.pop();
  return out.join('');
}

/** Inline formatting on an already-escaped line. */
function renderInline(text: string): string {
  // Protect code spans first so their contents are not formatted
  const codes: string[] = [];
  let s = text.replace(/`([^`]+)`/g, (_m, code: string) => {
    codes.push(code);
    return `\u0000${codes.length - 1}\u0000`;
  });

  s = s
    .replace(/\*\*(?=\S)([^*]*?\S)\*\*/g, '<strong>$1</strong>')
    .replace(/__(?=\S)([^_]*?\S)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*(?=\S)([^*]*?\S)\*(?![*\w])/g, '$1<em>$2</em>')
    .replace(/(^|[^_\w])_(?=\S)([^_]*?\S)_(?![_\w])/g, '$1<em>$2</em>');

  return s.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => `<code>${codes[Number(i)]}</code>`);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** `{{ text | chatMarkdown }}` for [innerHTML]; pure, so each message is rendered once. */
@Pipe({ name: 'chatMarkdown', standalone: true, pure: true })
export class ChatMarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return renderChatMarkdown(value ?? '');
  }
}
