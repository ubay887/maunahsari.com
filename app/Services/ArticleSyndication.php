<?php

namespace App\Services;

use App\Models\Article;
use App\Models\Event;
use XMLWriter;

class ArticleSyndication
{
    public function rss(): string
    {
        $xml = new XMLWriter;
        $xml->openMemory();
        $xml->startDocument('1.0', 'UTF-8');
        $xml->startElement('rss');
        $xml->writeAttribute('version', '2.0');
        $xml->startElement('channel');
        $xml->writeElement('title', config('app.name').' — Artikel');
        $xml->writeElement('link', route('articles.index'));
        $xml->writeElement('description', 'Kabar dan kegiatan pesantren');
        $xml->writeElement('language', 'id');
        foreach (Article::published()->orderByDesc('published_at')->orderByDesc('id')->limit(50)->get() as $article) {
            $xml->startElement('item');
            $xml->writeElement('title', $article->title);
            $xml->writeElement('link', route('articles.show', $article->slug));
            $xml->writeElement('guid', route('articles.show', $article->slug));
            $xml->writeElement('description', strip_tags($article->excerpt ?: $article->content));
            $xml->writeElement('pubDate', $article->published_at?->toRfc2822String());
            $xml->endElement();
        }
        $xml->endElement();
        $xml->endElement();
        $xml->endDocument();

        return $xml->outputMemory();
    }

    public function sitemap(): void
    {
        $xml = new XMLWriter;
        $xml->openUri('php://output');
        $xml->startDocument('1.0', 'UTF-8');
        $xml->startElement('urlset');
        $xml->writeAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
        foreach (['home', 'site.profile', 'site.pondok.putra', 'site.pondok.putri', 'site.contact', 'articles.index', 'events.index', 'psb.index'] as $name) {
            $xml->startElement('url');
            $xml->writeElement('loc', route($name));
            $xml->endElement();
        }
        foreach (Article::published()->select(['id', 'slug', 'updated_at'])->lazyById(500) as $article) {
            $xml->startElement('url');
            $xml->writeElement('loc', route('articles.show', $article->slug));
            $xml->writeElement('lastmod', $article->updated_at?->toAtomString());
            $xml->endElement();
            $xml->flush();
        }
        foreach (Event::published()->select(['id', 'slug', 'updated_at'])->lazyById(500) as $event) {
            $xml->startElement('url');
            $xml->writeElement('loc', route('events.show', $event->slug));
            $xml->writeElement('lastmod', $event->updated_at?->toAtomString());
            $xml->endElement();
            $xml->flush();
        }
        $xml->endElement();
        $xml->endDocument();
        $xml->flush();
    }
}
