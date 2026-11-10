<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/** Re-encode profile pictures so embedded metadata is never shared. */
class AlumniPhotos
{
    public function store(UploadedFile $photo): string
    {
        $contents = file_get_contents($photo->getPathname());
        if ($contents === false) {
            throw new RuntimeException('Foto gagal dibaca.');
        }
        $image = imagecreatefromstring($contents);
        if ($image === false) {
            throw new RuntimeException('Foto tidak dapat diproses.');
        }
        ob_start();
        try {
            $encoded = imagewebp($image, null, 85);
            $buffer = ob_get_contents();
        } finally {
            ob_end_clean();
            imagedestroy($image);
        }
        if (! $encoded || $buffer === false) {
            throw new RuntimeException('Foto gagal diproses.');
        }
        $path = 'alumni/photos/'.Str::uuid().'.webp';
        if (! Storage::disk('local')->put($path, $buffer)) {
            throw new RuntimeException('Foto gagal disimpan.');
        }

        return $path;
    }
}
