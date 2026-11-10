import {
    createElement,
    useMemo,
    useSyncExternalStore,
    type ReactNode,
} from 'react';
import { articleContentClasses } from '@/lib/article-content-styles';
const allowed = new Set([
    'p',
    'h2',
    'h3',
    'h4',
    'ul',
    'ol',
    'li',
    'strong',
    'em',
    'a',
    'blockquote',
    'img',
    'code',
    'pre',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
]);
function safeUrl(value: string | null): string | undefined {
    if (!value) return undefined;
    try {
        const url = new URL(value, window.location.origin);
        return ['http:', 'https:'].includes(url.protocol)
            ? url.href
            : undefined;
    } catch {
        return undefined;
    }
}
function renderNode(node: ChildNode, key: string): ReactNode {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (!(node instanceof Element)) return null;
    const tag = node.tagName.toLowerCase();
    if (!allowed.has(tag)) return null;
    const children = Array.from(node.childNodes).map((child, index) =>
        renderNode(child, key + '-' + index),
    );
    if (tag === 'img')
        return createElement('img', {
            key,
            src: safeUrl(node.getAttribute('src')),
            alt: node.getAttribute('alt') ?? '',
            loading: 'lazy',
        });
    if (tag === 'a')
        return createElement(
            'a',
            {
                key,
                href: safeUrl(node.getAttribute('href')),
                rel: 'noopener noreferrer',
            },
            children,
        );
    // Tables here are sanitized article content, rather than an interactive data region.
    if (tag === 'td' || tag === 'th')
        return createElement(
            tag,
            {
                key,
                colSpan: Number(node.getAttribute('colspan') || 1),
                rowSpan: Number(node.getAttribute('rowspan') || 1),
            },
            children,
        );
    return createElement(tag, { key }, children);
}
const subscribeNever = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
/**
 * The sanitized HTML is parsed with the browser's DOMParser, so the content is
 * rendered after hydration. The server render (SSR) and the first client render
 * both output the empty wrapper, which keeps hydration consistent.
 */
export function ArticleContent({ html }: { html: string }) {
    const isClient = useSyncExternalStore(
        subscribeNever,
        clientSnapshot,
        serverSnapshot,
    );
    const content = useMemo(() => {
        if (!isClient) return null;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return Array.from(doc.body.childNodes).map((node, index) =>
            renderNode(node, String(index)),
        );
    }, [html, isClient]);
    return <div className={articleContentClasses}>{content}</div>;
}
