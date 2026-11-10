<?php

namespace Tests\Unit;

use App\Services\AlumniRadar;
use PHPUnit\Framework\TestCase;

class AlumniDistanceTest extends TestCase
{
    public function test_haversine_and_bands_have_expected_boundaries(): void
    {
        $this->assertSame(0.0, AlumniRadar::distance(0, 0, 0, 0));
        $this->assertEqualsWithDelta(111.195, AlumniRadar::distance(0, 0, 0, 1), 0.01);
        $this->assertSame('dalam 25 km', AlumniRadar::band(25));
        $this->assertSame('dalam 50 km', AlumniRadar::band(25.01));
        $this->assertSame('dalam 50 km', AlumniRadar::band(50));
        $this->assertSame('dalam 100 km', AlumniRadar::band(50.01));
    }
}
