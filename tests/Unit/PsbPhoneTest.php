<?php

namespace Tests\Unit;

use App\Services\PsbPhone;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class PsbPhoneTest extends TestCase
{
    /** @return array<string, array{string, string}> */
    public static function phoneNumbers(): array
    {
        return ['local' => ['081234567890', '6281234567890'], 'international' => ['+62 812-3456-7890', '6281234567890'], 'canonical' => ['6281234567890', '6281234567890'], 'invalid' => ['0812abc', '0812abc']];
    }

    #[DataProvider('phoneNumbers')]
    public function test_whatsapp_normalization_preserves_invalid_input_for_validation(string $input, string $expected): void
    {
        $this->assertSame($expected, PsbPhone::normalize($input));
    }
}
