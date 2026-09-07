<?php

namespace App\Services;

use App\Models\CertificateUser;
use Carbon\Carbon;

class CertificateNumberService
{
    /**
     * Generate certificate number with format: BICC{COUNTRY_CODE}{SEQUENCE}{MONTH}{YEAR}
     *
     * Example: BICCID001072026
     *   BICC   = fixed prefix
     *   ID     = 2-letter ISO country code (Indonesia = ID, Malaysia = MY, etc.)
     *   001    = 3-digit sequential number within the current year
     *   07     = 2-digit month of issuance
     *   2026   = 4-digit year of issuance
     *
     * @param string $publishedAt   Date string (e.g. "2026-07-01")
     * @param string $companyCountry  Country code (ISO Alpha-2 or Alpha-3) or full name
     * @return string
     */
    public static function generate(string $publishedAt, string $companyCountry = 'IDN'): string
    {
        $date  = Carbon::parse($publishedAt);
        $year  = $date->year;
        $month = $date->format('m');

        // Derive 2-letter ISO country code
        $countryCode = self::deriveCountryCode($companyCountry);

        // Count how many certificates were issued in this year (determines sequence)
        $countThisYear = CertificateUser::whereYear('published_at', $year)->count();
        $sequence = str_pad($countThisYear + 1, 3, '0', STR_PAD_LEFT);

        return 'BICC' . $countryCode . $sequence . $month . $year;
    }

    /**
     * Derive a 2-letter ISO-3166 Alpha-2 country code from:
     * - a 2-letter code  (e.g. "ID")
     * - a 3-letter code  (e.g. "IDN")
     * - a full country name (e.g. "Indonesia")
     */
    private static function deriveCountryCode(string $country): string
    {
        $country = trim($country);

        // Already a 2-letter Alpha-2 code
        if (strlen($country) === 2) {
            return strtoupper($country);
        }

        // ISO 3166-1 Alpha-3 → Alpha-2 mapping (ASEAN + common)
        $alpha3Map = [
            'IDN' => 'ID', 'MYS' => 'MY', 'SGP' => 'SG', 'PHL' => 'PH',
            'THA' => 'TH', 'VNM' => 'VN', 'BRN' => 'BN', 'MMR' => 'MM',
            'KHM' => 'KH', 'LAO' => 'LA', 'TLS' => 'TL', 'JPN' => 'JP',
            'CHN' => 'CN', 'KOR' => 'KR', 'AUS' => 'AU', 'IND' => 'IN',
            'USA' => 'US', 'GBR' => 'GB', 'DEU' => 'DE', 'FRA' => 'FR',
        ];

        $upper = strtoupper($country);
        if (isset($alpha3Map[$upper])) {
            return $alpha3Map[$upper];
        }

        // Full country name → Alpha-2 mapping
        $nameMap = [
            'indonesia'      => 'ID',
            'malaysia'       => 'MY',
            'singapore'      => 'SG',
            'philippines'    => 'PH',
            'thailand'       => 'TH',
            'vietnam'        => 'VN',
            'brunei'         => 'BN',
            'myanmar'        => 'MM',
            'cambodia'       => 'KH',
            'laos'           => 'LA',
            'timor-leste'    => 'TL',
            'japan'          => 'JP',
            'china'          => 'CN',
            'south korea'    => 'KR',
            'australia'      => 'AU',
            'india'          => 'IN',
            'united states'  => 'US',
            'united kingdom' => 'GB',
        ];

        $lower = strtolower($country);
        if (isset($nameMap[$lower])) {
            return $nameMap[$lower];
        }

        // Fallback: uppercase first 2 characters of whatever was given
        return strtoupper(substr($country, 0, 2));
    }
}
