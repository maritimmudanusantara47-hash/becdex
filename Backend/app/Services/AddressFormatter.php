<?php

namespace App\Services;

class AddressFormatter
{
    private static array $keepUppercase = [
        'PT', 'CV', 'UD', 'RT', 'RW', 'KAV', 'NO', 'KM', 'TBK', 'BICC', 'MMIC'
    ];

    public static function format(string $address): string
    {
        if (empty(trim($address))) return '';

        // 1. Bersihkan koma dobel dan spasi berulang
        $clean = preg_replace('/,(\s*,)+/', ',', $address);
        $clean = preg_replace('/\s*,\s*/', ', ', $clean);
        $clean = preg_replace('/\s+/', ' ', $clean);
        $clean = trim($clean, ", ");

        // 2. Smart Title Case (Ubah CAPSLOCK namun jaga singkatan)
        $words = explode(' ', $clean);
        $formatted = [];

        foreach ($words as $word) {
            $cleanWord = preg_replace('/[^a-zA-Z0-9]/', '', strtoupper($word));

            if (in_array($cleanWord, self::$keepUppercase)) {
                $formatted[] = strtoupper($word);
            } else {
                $formatted[] = mb_convert_case(mb_strtolower($word), MB_CASE_TITLE, 'UTF-8');
            }
        }

        $result = implode(' ', $formatted);

        // 3. Standarisasi singkatan umum
        $result = preg_replace('/\bNo\.\s*/i', 'No. ', $result);
        $result = preg_replace('/\bJl\.\s*/i', 'Jl. ', $result);
        $result = preg_replace('/\bKode Pos:\s*/i', 'Kode Pos: ', $result);

        return trim($result);
    }
}