<?php

namespace Database\Factories;

use App\ArticleStatus;
use App\Models\Article;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Article> */
class ArticleFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return ['title' => fake()->sentence(6), 'excerpt' => fake()->paragraph(),
            'content' => '<p>'.fake()->paragraph().'</p><p>'.fake()->paragraph().'</p>',
            'status' => ArticleStatus::Draft, 'author_id' => User::factory()];
    }

    public function published(): static
    {
        return $this->state(fn (): array => ['status' => ArticleStatus::Published, 'published_at' => now()->subDay()]);
    }

    public function scheduled(): static
    {
        return $this->state(fn (): array => ['status' => ArticleStatus::Scheduled, 'published_at' => now()->addDay()]);
    }
}
