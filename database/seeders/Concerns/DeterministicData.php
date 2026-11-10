<?php

namespace Database\Seeders\Concerns;

/**
 * Pilihan "acak" yang selalu sama untuk masukan yang sama, sehingga data demo
 * identik di setiap mesin dan seeder aman dijalankan ulang.
 */
trait DeterministicData
{
    protected function roll(string $salt, int $number, int $modulo): int
    {
        return crc32($salt.':'.$number) % $modulo;
    }

    /**
     * @template T
     *
     * @param  array<int, T>  $items
     * @return T
     */
    protected function pick(string $salt, int $number, array $items): mixed
    {
        return $items[$this->roll($salt, $number, count($items))];
    }
}
