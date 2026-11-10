<?php

namespace Database\Seeders\Concerns;

/** Nama orang Indonesia (gaya pesantren) yang dirangkai deterministik dan tidak kembar dalam satu seeder. */
trait IndonesianNames
{
    use DeterministicData;

    private const MALE_FIRST = ['Muhammad', 'Ahmad', 'Abdul', 'Moh.', 'Mochamad', 'Nur', 'M.', 'Abdullah'];

    private const MALE_GIVEN = ['Rizky', 'Fadhil', 'Naufal', 'Hilmi', 'Syafiq', 'Wildan', 'Alif', 'Dzaki', 'Irfan', 'Fauzan', 'Ridwan', 'Salman', 'Taufik', 'Zainal', 'Hafidz', 'Habib', 'Luqman', 'Hanif', 'Imam', 'Mahfudz', 'Anwar', 'Bayu', 'Dimas', 'Faiz', 'Gilang', 'Yusuf', 'Ilham', 'Rafi'];

    private const MALE_LAST = ['Ramadhan', 'Hidayat', 'Pratama', 'Saputra', 'Firmansyah', 'Maulana', 'Nugroho', 'Wibowo', 'Hakim', 'Fauzi', 'Alamsyah', 'Kurniawan', 'Setiawan', 'Rahman', 'Syahputra', 'Mubarok', 'Habibi', 'Zakaria', 'Abidin', 'Anshori', 'Mahmudi', 'Muzakki', 'Amrullah'];

    private const FEMALE_FIRST = ['Siti', 'Nur', 'Aisyah', 'Fatimah', 'Khoirun', 'Dewi', 'Putri', 'Rahma', 'Zahra'];

    private const FEMALE_GIVEN = ['Nabila', 'Aulia', 'Salsabila', 'Humaira', 'Latifah', 'Maryam', 'Najwa', 'Kholifah', 'Azizah', 'Mawaddah', 'Nafisah', 'Rofiqoh', 'Syifa', 'Fitria', 'Alfiyah', 'Hanifah', 'Layla', 'Mufidah', 'Sakinah', 'Tsaniya', 'Wardah', 'Zulfa', 'Ainun', 'Inayah'];

    private const FEMALE_LAST = ['Rahmawati', 'Wulandari', 'Fitriani', 'Lestari', 'Anggraini', 'Safitri', 'Maharani', 'Nuraini', 'Khasanah', 'Mahmudah', 'Hidayah', 'Amalia', 'Febriani', 'Munawaroh', 'Kurniasih', 'Zahroh', 'Ulfa', 'Rosyidah'];

    /**
     * @param  array<string, true>  $names  nama yang sudah dipakai; diperbarui oleh metode ini
     */
    protected function fullName(int $number, bool $male, array &$names, string $salt = ''): string
    {
        [$first, $given, $last] = $male
            ? [self::MALE_FIRST, self::MALE_GIVEN, self::MALE_LAST]
            : [self::FEMALE_FIRST, self::FEMALE_GIVEN, self::FEMALE_LAST];
        for ($attempt = 0; ; $attempt++) {
            $name = implode(' ', [
                $this->pick($salt.'first'.$attempt, $number, $first),
                $this->pick($salt.'given'.$attempt, $number, $given),
                $this->pick($salt.'last'.$attempt, $number, $last),
            ]);
            if (! isset($names[$name])) {
                $names[$name] = true;

                return $name;
            }
        }
    }

    /** Nama wali: nama depan baru dengan nama belakang anak, diawali gelar haji/hajjah untuk sebagian. */
    protected function guardianName(string $childName, bool $male, int $number): string
    {
        $given = $male ? self::MALE_GIVEN : self::FEMALE_GIVEN;
        $surname = (string) last(explode(' ', $childName));
        $title = $this->roll('haji', $number, 100) < 35 ? ($male ? 'H. ' : 'Hj. ') : '';

        return $title.$this->pick('guardian-first', $number, $male ? self::MALE_FIRST : self::FEMALE_FIRST).' '.$this->pick('guardian-given', $number, $given).' '.$surname;
    }
}
