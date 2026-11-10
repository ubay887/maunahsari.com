<?php

namespace App\Console\Commands;

use App\ArticleStatus;
use App\Models\Article;
use Illuminate\Console\Command;

class PublishScheduledArticles extends Command
{
    protected $signature = 'articles:publish-scheduled';

    protected $description = 'Publish articles whose scheduled publication time has arrived';

    public function handle(): int
    {
        $count = Article::where('status', ArticleStatus::Scheduled)->whereNotNull('published_at')->where('published_at', '<=', now())->update(['status' => ArticleStatus::Published]);
        $this->info($count.' artikel diterbitkan.');

        return self::SUCCESS;
    }
}
