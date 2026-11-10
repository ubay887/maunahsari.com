<?php

namespace Database\Factories;

use App\EventStatus;
use App\EventType;
use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(5), 'summary' => fake()->paragraph(),
            'description' => '<p>'.fake()->paragraph().'</p>',
            'start_at' => now()->addWeek(), 'end_at' => now()->addWeek()->addHours(2),
            'timezone' => 'Asia/Jakarta', 'type' => EventType::Offline,
            'location_name' => 'Aula Pesantren', 'address' => 'Kompleks Pesantren Maunahsari',
            'status' => EventStatus::Draft, 'organizer_id' => User::factory(),
        ];
    }

    public function published(): static
    {
        return $this->state(fn (): array => ['status' => EventStatus::Published]);
    }

    public function ongoing(): static
    {
        return $this->state(fn (): array => ['start_at' => now()->subHour(), 'end_at' => now()->addHour()]);
    }

    public function past(): static
    {
        return $this->state(fn (): array => ['start_at' => now()->subDay()->subHours(2), 'end_at' => now()->subDay()]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (): array => ['status' => EventStatus::Cancelled]);
    }

    public function online(): static
    {
        return $this->state(fn (): array => ['type' => EventType::Online, 'meeting_url' => 'https://meet.google.com/abc-defg-hij', 'location_name' => null, 'address' => null]);
    }
}
