import type { PrismTheme } from 'prism-react-renderer';

/** Syntax theme backed by CSS variables (src/index.css), so it follows light/dark automatically. */
export const prismTheme: PrismTheme = {
  plain: { color: 'var(--syntax-plain)', backgroundColor: 'transparent' },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata', 'blockquote'], style: { color: 'var(--syntax-comment)', fontStyle: 'italic' } },
    { types: ['keyword', 'atrule', 'important', 'module', 'control-flow', 'list'], style: { color: 'var(--syntax-keyword)' } },
    { types: ['string', 'char', 'attr-value', 'template-string', 'regex', 'inserted', 'code-snippet'], style: { color: 'var(--syntax-string)' } },
    { types: ['function', 'method', 'url'], style: { color: 'var(--syntax-function)' } },
    { types: ['tag', 'selector', 'deleted'], style: { color: 'var(--syntax-tag)' } },
    { types: ['attr-name'], style: { color: 'var(--syntax-attr)' } },
    { types: ['number', 'boolean', 'constant', 'symbol', 'unit', 'hexcode'], style: { color: 'var(--syntax-number)' } },
    { types: ['class-name', 'maybe-class-name', 'builtin'], style: { color: 'var(--syntax-class)' } },
    { types: ['property', 'property-access', 'variable'], style: { color: 'var(--syntax-property)' } },
    { types: ['punctuation', 'operator', 'code-language', 'hr'], style: { color: 'var(--syntax-punctuation)' } },
    { types: ['title'], style: { color: 'var(--syntax-heading)', fontWeight: '600' } },
    { types: ['bold'], style: { fontWeight: '600' } },
    { types: ['italic'], style: { fontStyle: 'italic' } },
    { types: ['code-block'], style: { color: 'var(--syntax-plain)' } },
  ],
};
