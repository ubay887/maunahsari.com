<title data-inertia="">{{ $eventMeta['title'] }} - {{ config('app.name') }}</title>
<meta data-inertia="description" name="description" content="{{ $eventMeta['description'] }}">
<link data-inertia="canonical" rel="canonical" href="{{ $eventMeta['canonical'] }}">
<meta data-inertia="og:title" property="og:title" content="{{ $eventMeta['title'] }}">
<meta data-inertia="og:description" property="og:description" content="{{ $eventMeta['description'] }}">
<meta data-inertia="og:type" property="og:type" content="website">
<meta data-inertia="og:url" property="og:url" content="{{ $eventMeta['canonical'] }}">
@if ($eventMeta['image'])
    <meta data-inertia="og:image" property="og:image" content="{{ $eventMeta['image'] }}">
@endif
@if ($eventMeta['preview'])
    <meta data-inertia="robots" name="robots" content="noindex,nofollow">
@endif
@if ($eventMeta['schema'])
    {{-- EventSeo encodes JSON with JSON_HEX_TAG to keep script content inert. --}}
    <script data-inertia="event-schema" type="application/ld+json">{!! $eventMeta['schema'] !!}</script>
@endif
