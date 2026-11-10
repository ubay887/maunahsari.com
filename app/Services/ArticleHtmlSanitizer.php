<?php

namespace App\Services;

use HTMLPurifier;
use HTMLPurifier_Config;

class ArticleHtmlSanitizer
{
    public function clean(string $html): string
    {
        $config = HTMLPurifier_Config::createDefault();
        $config->set('Core.Encoding', 'UTF-8');
        $config->set('HTML.Allowed', 'p,h2,h3,h4,ul,ol,li,strong,em,a[href|title],blockquote,img[src|alt|width|height],code,pre,table,thead,tbody,tfoot,tr,th[colspan|rowspan],td[colspan|rowspan]');
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true]);
        $config->set('HTML.ForbiddenElements', ['script', 'style', 'iframe', 'object', 'embed', 'form']);
        $config->set('Cache.SerializerPath', storage_path('framework/cache'));

        return (new HTMLPurifier($config))->purify($html);
    }
}
