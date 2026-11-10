<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Validation\ValidationException;
use SimpleXMLElement;
use ZipArchive;

class AlumniSpreadsheet
{
    /** @return list<list<string>> */
    public function read(UploadedFile $file): array
    {
        if (strtolower($file->getClientOriginalExtension()) === 'xlsx') {
            return $this->xlsx($file->getPathname());
        }
        $stream = fopen($file->getPathname(), 'r');
        if ($stream === false) {
            $this->invalid();
        }
        $rows = [];
        try {
            while (($row = fgetcsv($stream, 20000, escape: '')) !== false) {
                if (count($rows) >= 1001 || count($row) > 40) {
                    $this->invalid();
                } $rows[] = array_map(fn (?string $value): string => $value ?? '', $row);
            }
        } finally {
            fclose($stream);
        }

        return $rows;
    }

    /** @return list<list<string>> */
    private function xlsx(string $path): array
    {
        $zip = new ZipArchive;
        if ($zip->open($path) !== true) {
            $this->invalid();
        }
        try {
            $total = 0;
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $stat = $zip->statIndex($i);
                if ($stat === false) {
                    $this->invalid();
                } $total += $stat['size'];
                if ($stat['size'] > 8000000 || $total > 20000000) {
                    $this->invalid();
                }
            }
            $strings = [];
            if ($zip->locateName('xl/sharedStrings.xml') !== false) {
                $xml = $this->xml($zip->getFromName('xl/sharedStrings.xml'));
                foreach ($xml->si as $item) {
                    $text = '';
                    foreach ($item->xpath('.//*[local-name()="t"]') ?: [] as $part) {
                        $text .= (string) $part;
                    } $strings[] = $text;
                }
            }
            $sheet = $this->xml($zip->getFromName('xl/worksheets/sheet1.xml'));
            $rows = [];
            foreach ($sheet->sheetData->row as $row) {
                if (count($rows) >= 1001) {
                    $this->invalid();
                } $cells = [];
                foreach ($row->c as $cell) {
                    if (isset($cell->f)) {
                        throw ValidationException::withMessages(['file' => 'Formula Excel tidak diterima; tempel sebagai nilai terlebih dahulu.']);
                    }
                    $reference = preg_replace('/[0-9]/', '', (string) $cell['r']);
                    $index = 0;
                    foreach (str_split($reference ?? '') as $letter) {
                        $index = $index * 26 + ord($letter) - 64;
                    }
                    if ($index < 1 || $index > 40) {
                        $this->invalid();
                    }
                    $value = (string) $cell->v;
                    if ((string) $cell['t'] === 's') {
                        $value = $strings[(int) $value] ?? '';
                    }
                    if ((string) $cell['t'] === 'inlineStr') {
                        $value = (string) $cell->is->t;
                    }
                    $cells[$index - 1] = $value;
                }
                if ($cells !== []) {
                    $values = array_fill(0, max(array_keys($cells)) + 1, '');
                    foreach ($cells as $index => $value) {
                        $values[$index] = $value;
                    } $rows[] = array_values($values);
                }
            }

            return $rows;
        } finally {
            $zip->close();
        }
    }

    private function xml(string|false $text): SimpleXMLElement
    {
        if ($text === false || preg_match('/<!DOCTYPE|<!ENTITY/i', $text)) {
            $this->invalid();
        }
        $previous = libxml_use_internal_errors(true);
        try {
            $xml = simplexml_load_string($text, SimpleXMLElement::class, LIBXML_NONET);
            if ($xml === false) {
                $this->invalid();
            }

            return $xml;
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
        }
    }

    private function invalid(): never
    {
        throw ValidationException::withMessages(['file' => 'Berkas tidak valid atau terlalu besar. Maksimal 1.000 baris dan 40 kolom.']);
    }
}
