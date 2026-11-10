<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\User;
use App\Services\ArticleAccess;

class ArticlePolicy
{
    public function __construct(private ArticleAccess $access) {}

    public function viewAny(User $user): bool
    {
        return $this->access->canWrite($user);
    }

    public function create(User $user): bool
    {
        return $this->access->canWrite($user);
    }

    public function update(User $user, Article $article): bool
    {
        return $this->access->canPublish($user) || ($this->access->canWrite($user) && $article->author_id === $user->id);
    }

    public function view(User $user, Article $article): bool
    {
        return $this->update($user, $article);
    }

    public function delete(User $user, Article $article): bool
    {
        return $this->update($user, $article);
    }

    public function publish(User $user, ?Article $article = null): bool
    {
        return $this->access->canPublish($user) && ($article === null || $this->update($user, $article));
    }

    public function manageTaxonomies(User $user): bool
    {
        return $this->access->canPublish($user);
    }
}
