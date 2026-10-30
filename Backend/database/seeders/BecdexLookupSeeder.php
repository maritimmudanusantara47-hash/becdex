<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BecdexCategory;
use App\Models\SubmissionStatus;
use App\Models\PerIndicatorStatus;
use App\Models\CompanyField;
use App\Models\Country;
use App\Models\Certificate;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;

class BecdexLookupSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // 1. BECdex Categories
        $cats = [
            ['id' => 1, 'name' => 'Not a Blue Economy Company', 'max_score' => 68, 'color' => 'danger'],
            ['id' => 2, 'name' => 'Standard Blue Economy Company', 'max_score' => 78, 'color' => 'info'],
            ['id' => 3, 'name' => 'Good Blue Economy Company', 'max_score' => 88, 'color' => 'primary'],
            ['id' => 4, 'name' => 'Excellent Economy Company', 'max_score' => 100, 'color' => 'success'],
        ];
        foreach ($cats as $c) {
            BecdexCategory::updateOrCreate(['id' => $c['id']], $c);
        }

        // 2. Submission Statuses
        $statuses = [
            ['id' => 1, 'name' => 'Pending Payment', 'color' => 'warning'],
            ['id' => 2, 'name' => 'Document Submission', 'color' => 'info'],
            ['id' => 3, 'name' => 'On Verification Process', 'color' => 'primary'],
            ['id' => 4, 'name' => 'Document Submission (Second Attempt)', 'color' => 'warning'],
            ['id' => 5, 'name' => 'Certified', 'color' => 'success'],
            ['id' => 6, 'name' => 'Payment Successful', 'color' => 'success'],
            ['id' => 7, 'name' => 'Continue To Location Survey', 'color' => 'light'],
            ['id' => 8, 'name' => 'Approved (Ready for Payment)', 'color' => 'primary'],
            ['id' => 9, 'name' => 'Rejected Permanently', 'color' => 'danger'],
        ];
        foreach ($statuses as $s) {
            SubmissionStatus::updateOrCreate(['id' => $s['id']], $s);
        }

        // 3. Per-Indicator Statuses (6 Statuses)
        $perInd = [
            ['id' => 1, 'name' => 'Not Uploaded', 'color' => 'secondary'],
            ['id' => 2, 'name' => 'Uploaded', 'color' => 'warning'],
            ['id' => 3, 'name' => 'Submitted', 'color' => 'primary'],
            ['id' => 4, 'name' => 'Verified', 'color' => 'success'],
            ['id' => 5, 'name' => 'Declined', 'color' => 'danger'],
            ['id' => 6, 'name' => 'Invalid', 'color' => 'danger'],
        ];
        foreach ($perInd as $p) {
            PerIndicatorStatus::updateOrCreate(['id' => $p['id']], $p);
        }

        // 4. Company Fields (13 Official Blue Economy Sectors with Bilingual Translations)
        $fields = [
            ['id' => 1, 'name' => 'Marine Tourism and Cruise Ships', 'name_id' => 'Wisata Bahari dan Kapal Pesiar'],
            ['id' => 2, 'name' => 'Maritime Research and Education', 'name_id' => 'Penelitian dan Pendidikan Maritim'],
            ['id' => 3, 'name' => 'Ocean Building', 'name_id' => 'Gedung Ocean'],
            ['id' => 4, 'name' => 'Marine Fisheries and Aquaculture', 'name_id' => 'Perikanan Laut dan Akuakultur'],
            ['id' => 5, 'name' => 'Deep Sea Mining, Oil, and Gas', 'name_id' => 'Pertambangan, Minyak, dan Gas Laut Dalam'],
            ['id' => 6, 'name' => 'Seawater Desalination', 'name_id' => 'Desalinasi Air Laut'],
            ['id' => 7, 'name' => 'Marine Renewable Energy', 'name_id' => 'Energi Terbarukan Kelautan'],
            ['id' => 8, 'name' => 'Marine Communication, Equipment and Instrumentation', 'name_id' => 'Komunikasi, Peralatan, dan Instrumentasi Kelautan'],
            ['id' => 9, 'name' => 'Marine Defense and Security', 'name_id' => 'Pertahanan dan Keamanan Laut'],
            ['id' => 10, 'name' => 'Marine Biotechnology and Bioproducts Processing', 'name_id' => 'Bioteknologi Kelautan dan Pemrosesan Bioproduk'],
            ['id' => 11, 'name' => 'Maritime Transport, Shipping, and Ports', 'name_id' => 'Transportasi Maritim, Pelayaran, dan Pelabuhan'],
            ['id' => 12, 'name' => 'Ship and Boat Building', 'name_id' => 'Pembuatan Kapal dan Perahu'],
            ['id' => 13, 'name' => 'Marine Finance, Investment, and Banking', 'name_id' => 'Keuangan, Investasi, dan Perbankan Kelautan'],
        ];
        foreach ($fields as $f) {
            CompanyField::updateOrCreate(['id' => $f['id']], $f);
        }

        // 5. Countries (All Countries with Cleaned ISO Alpha-2 Codes)
        $countries = [
            ['id' => 1, 'iso' => 'AL', 'name' => 'Albania'],
            ['id' => 2, 'iso' => 'DZ', 'name' => 'Algeria'],
            ['id' => 3, 'iso' => 'AO', 'name' => 'Angola'],
            ['id' => 4, 'iso' => 'AG', 'name' => 'Antigua and Barbuda'],
            ['id' => 5, 'iso' => 'AR', 'name' => 'Argentina'],
            ['id' => 6, 'iso' => 'AU', 'name' => 'Australia'],
            ['id' => 7, 'iso' => 'AZ', 'name' => 'Azerbaijan'],
            ['id' => 8, 'iso' => 'BS', 'name' => 'Bahamas'],
            ['id' => 9, 'iso' => 'BH', 'name' => 'Bahrain'],
            ['id' => 10, 'iso' => 'BD', 'name' => 'Bangladesh'],
            ['id' => 11, 'iso' => 'BY', 'name' => 'Belarus'],
            ['id' => 12, 'iso' => 'BE', 'name' => 'Belgium'],
            ['id' => 13, 'iso' => 'BZ', 'name' => 'Belize'],
            ['id' => 14, 'iso' => 'BJ', 'name' => 'Benin'],
            ['id' => 15, 'iso' => 'BA', 'name' => 'Bosnia and Herzegovina'],
            ['id' => 16, 'iso' => 'BR', 'name' => 'Brazil'],
            ['id' => 17, 'iso' => 'BN', 'name' => 'Brunei Darussalam'],
            ['id' => 18, 'iso' => 'BG', 'name' => 'Bulgaria'],
            ['id' => 19, 'iso' => 'CV', 'name' => 'Cabo Verde'],
            ['id' => 20, 'iso' => 'KH', 'name' => 'Cambodia'],
            ['id' => 21, 'iso' => 'CM', 'name' => 'Cameroon'],
            ['id' => 22, 'iso' => 'CA', 'name' => 'Canada'],
            ['id' => 23, 'iso' => 'CL', 'name' => 'Chile'],
            ['id' => 24, 'iso' => 'CN', 'name' => 'China'],
            ['id' => 25, 'iso' => 'CO', 'name' => 'Colombia'],
            ['id' => 26, 'iso' => 'KM', 'name' => 'Comoros'],
            ['id' => 27, 'iso' => 'CG', 'name' => 'Congo'],
            ['id' => 28, 'iso' => 'CR', 'name' => 'Costa Rica'],
            ['id' => 29, 'iso' => 'CI', 'name' => 'Côte D Ivoire'],
            ['id' => 30, 'iso' => 'HR', 'name' => 'Croatia'],
            ['id' => 31, 'iso' => 'CU', 'name' => 'Cuba'],
            ['id' => 32, 'iso' => 'CY', 'name' => 'Cyprus'],
            ['id' => 33, 'iso' => 'KP', 'name' => 'DPR Korea'],
            ['id' => 34, 'iso' => 'CD', 'name' => 'DR Congo'],
            ['id' => 35, 'iso' => 'DK', 'name' => 'Denmark'],
            ['id' => 36, 'iso' => 'DJ', 'name' => 'Djibouti'],
            ['id' => 37, 'iso' => 'DM', 'name' => 'Dominica'],
            ['id' => 38, 'iso' => 'DO', 'name' => 'Dominican Republic'],
            ['id' => 39, 'iso' => 'EC', 'name' => 'Ecuador'],
            ['id' => 40, 'iso' => 'EG', 'name' => 'Egypt'],
            ['id' => 41, 'iso' => 'SV', 'name' => 'El Salvador'],
            ['id' => 42, 'iso' => 'GQ', 'name' => 'Equatorial Guinea'],
            ['id' => 43, 'iso' => 'ER', 'name' => 'Eritrea'],
            ['id' => 44, 'iso' => 'EE', 'name' => 'Estonia'],
            ['id' => 45, 'iso' => 'FJ', 'name' => 'Fiji'],
            ['id' => 46, 'iso' => 'FI', 'name' => 'Finland'],
            ['id' => 47, 'iso' => 'FR', 'name' => 'France'],
            ['id' => 48, 'iso' => 'GA', 'name' => 'Gabon'],
            ['id' => 49, 'iso' => 'GM', 'name' => 'Gambia'],
            ['id' => 50, 'iso' => 'GE', 'name' => 'Georgia'],
            ['id' => 51, 'iso' => 'DE', 'name' => 'Germany'],
            ['id' => 52, 'iso' => 'GH', 'name' => 'Ghana'],
            ['id' => 53, 'iso' => 'GR', 'name' => 'Greece'],
            ['id' => 54, 'iso' => 'GD', 'name' => 'Grenada'],
            ['id' => 55, 'iso' => 'GT', 'name' => 'Guatemala'],
            ['id' => 56, 'iso' => 'GN', 'name' => 'Guinea'],
            ['id' => 57, 'iso' => 'GW', 'name' => 'Guinea Bissau'],
            ['id' => 58, 'iso' => 'GY', 'name' => 'Guyana'],
            ['id' => 59, 'iso' => 'HT', 'name' => 'Haiti'],
            ['id' => 60, 'iso' => 'HN', 'name' => 'Honduras'],
            ['id' => 61, 'iso' => 'IS', 'name' => 'Iceland'],
            ['id' => 62, 'iso' => 'IN', 'name' => 'India'],
            ['id' => 63, 'iso' => 'ID', 'name' => 'Indonesia'],
            ['id' => 64, 'iso' => 'IR', 'name' => 'Iran (Islamic Republic of)'],
            ['id' => 65, 'iso' => 'IQ', 'name' => 'Iraq'],
            ['id' => 66, 'iso' => 'IE', 'name' => 'Ireland'],
            ['id' => 67, 'iso' => 'IL', 'name' => 'Israel'],
            ['id' => 68, 'iso' => 'IT', 'name' => 'Italy'],
            ['id' => 69, 'iso' => 'JM', 'name' => 'Jamaica'],
            ['id' => 70, 'iso' => 'JP', 'name' => 'Japan'],
            ['id' => 71, 'iso' => 'JO', 'name' => 'Jordan'],
            ['id' => 72, 'iso' => 'KZ', 'name' => 'Kazakhstan'],
            ['id' => 73, 'iso' => 'KE', 'name' => 'Kenya'],
            ['id' => 74, 'iso' => 'KI', 'name' => 'Kiribati'],
            ['id' => 75, 'iso' => 'KW', 'name' => 'Kuwait'],
            ['id' => 76, 'iso' => 'LV', 'name' => 'Latvia'],
            ['id' => 77, 'iso' => 'LB', 'name' => 'Lebanon'],
            ['id' => 78, 'iso' => 'LR', 'name' => 'Liberia'],
            ['id' => 79, 'iso' => 'LY', 'name' => 'Libya'],
            ['id' => 80, 'iso' => 'LT', 'name' => 'Lithuania'],
            ['id' => 81, 'iso' => 'MG', 'name' => 'Madagascar'],
            ['id' => 82, 'iso' => 'MY', 'name' => 'Malaysia'],
            ['id' => 83, 'iso' => 'MV', 'name' => 'Maldives'],
            ['id' => 84, 'iso' => 'MT', 'name' => 'Malta'],
            ['id' => 85, 'iso' => 'MH', 'name' => 'Marshall Islands'],
            ['id' => 86, 'iso' => 'MR', 'name' => 'Mauritania'],
            ['id' => 87, 'iso' => 'MU', 'name' => 'Mauritius'],
            ['id' => 88, 'iso' => 'MX', 'name' => 'Mexico'],
            ['id' => 89, 'iso' => 'FM', 'name' => 'Micronesia (Federated States of)'],
            ['id' => 90, 'iso' => 'MC', 'name' => 'Monaco'],
            ['id' => 91, 'iso' => 'ME', 'name' => 'Montenegro'],
            ['id' => 92, 'iso' => 'MA', 'name' => 'Morocco'],
            ['id' => 93, 'iso' => 'MZ', 'name' => 'Mozambique'],
            ['id' => 94, 'iso' => 'MM', 'name' => 'Myanmar'],
            ['id' => 95, 'iso' => 'NA', 'name' => 'Namibia'],
            ['id' => 96, 'iso' => 'NR', 'name' => 'Nauru'],
            ['id' => 97, 'iso' => 'NP', 'name' => 'Netherlands'],
            ['id' => 98, 'iso' => 'NZ', 'name' => 'New Zealand'],
            ['id' => 99, 'iso' => 'NI', 'name' => 'Nicaragua'],
            ['id' => 100, 'iso' => 'NG', 'name' => 'Nigeria'],
            ['id' => 101, 'iso' => 'NO', 'name' => 'Norway'],
            ['id' => 102, 'iso' => 'OM', 'name' => 'Oman'],
            ['id' => 103, 'iso' => 'PK', 'name' => 'Pakistan'],
            ['id' => 104, 'iso' => 'PW', 'name' => 'Palau'],
            ['id' => 105, 'iso' => 'PA', 'name' => 'Panama'],
            ['id' => 106, 'iso' => 'PG', 'name' => 'Papua New Guinea'],
            ['id' => 107, 'iso' => 'PE', 'name' => 'Peru'],
            ['id' => 108, 'iso' => 'PH', 'name' => 'Philippines'],
            ['id' => 109, 'iso' => 'PL', 'name' => 'Poland'],
            ['id' => 110, 'iso' => 'PT', 'name' => 'Portugal'],
            ['id' => 111, 'iso' => 'QA', 'name' => 'Qatar'],
            ['id' => 112, 'iso' => 'KR', 'name' => 'Republic of Korea'],
            ['id' => 113, 'iso' => 'RO', 'name' => 'Romania'],
            ['id' => 114, 'iso' => 'RU', 'name' => 'Russian Federation'],
            ['id' => 115, 'iso' => 'KN', 'name' => 'Saint Kitts and Nevis'],
            ['id' => 116, 'iso' => 'LC', 'name' => 'Saint Lucia'],
            ['id' => 117, 'iso' => 'VC', 'name' => 'Saint Vincent and the Grenadines'],
            ['id' => 118, 'iso' => 'WS', 'name' => 'Samoa'],
            ['id' => 119, 'iso' => 'ST', 'name' => 'Sao Tome and Principe'],
            ['id' => 120, 'iso' => 'SA', 'name' => 'Saudi Arabia'],
            ['id' => 121, 'iso' => 'SN', 'name' => 'Senegal'],
            ['id' => 122, 'iso' => 'SC', 'name' => 'Seychelles'],
            ['id' => 123, 'iso' => 'SL', 'name' => 'Sierra Leone'],
            ['id' => 124, 'iso' => 'SG', 'name' => 'Singapore'],
            ['id' => 125, 'iso' => 'SI', 'name' => 'Slovenia'],
            ['id' => 126, 'iso' => 'AX', 'name' => 'Solomon Islands'],
            ['id' => 127, 'iso' => 'SO', 'name' => 'Somalia'],
            ['id' => 128, 'iso' => 'ZA', 'name' => 'South Africa'],
            ['id' => 129, 'iso' => 'ES', 'name' => 'Spain'],
            ['id' => 130, 'iso' => 'LK', 'name' => 'Sri Lanka'],
            ['id' => 131, 'iso' => 'SD', 'name' => 'Sudan'],
            ['id' => 132, 'iso' => 'SR', 'name' => 'Suriname'],
            ['id' => 133, 'iso' => 'SE', 'name' => 'Sweden'],
            ['id' => 134, 'iso' => 'SY', 'name' => 'Syrian Arab Republic'],
            ['id' => 135, 'iso' => 'TJ', 'name' => 'Tanzania'],
            ['id' => 136, 'iso' => 'TH', 'name' => 'Thailand'],
            ['id' => 137, 'iso' => 'TL', 'name' => 'Timor-Leste'],
            ['id' => 138, 'iso' => 'TG', 'name' => 'Togo'],
            ['id' => 139, 'iso' => 'TO', 'name' => 'Tonga'],
            ['id' => 140, 'iso' => 'TT', 'name' => 'Trinidad and Tobago'],
            ['id' => 141, 'iso' => 'TN', 'name' => 'Tunisia'],
            ['id' => 142, 'iso' => 'TR', 'name' => 'Türkiye'],
            ['id' => 143, 'iso' => 'TM', 'name' => 'Turkmenistan'],
            ['id' => 144, 'iso' => 'TV', 'name' => 'Tuvalu'],
            ['id' => 145, 'iso' => 'UA', 'name' => 'Ukraine'],
            ['id' => 146, 'iso' => 'AE', 'name' => 'United Arab Emirates'],
            ['id' => 147, 'iso' => 'GB', 'name' => 'United Kingdom of Great Britain and Northern Ireland'],
            ['id' => 148, 'iso' => 'UM', 'name' => 'United States of America'],
            ['id' => 149, 'iso' => 'UY', 'name' => 'Uruguay'],
            ['id' => 150, 'iso' => 'VU', 'name' => 'Vanuatu'],
            ['id' => 151, 'iso' => 'VE', 'name' => 'Venezuela, Bolivarian Republic of'],
            ['id' => 152, 'iso' => 'VN', 'name' => 'Viet Nam'],
            ['id' => 153, 'iso' => 'YE', 'name' => 'Yemen'],
        ];
        foreach ($countries as $country) {
            Country::updateOrCreate(['id' => $country['id']], $country);
        }

        // 6. Default Settings
        Setting::updateOrCreate(['key' => 'payment_amount'], ['value' => '100000', 'description' => 'Certification fee in IDR']);
        Setting::updateOrCreate(['key' => 'xendit_secret_key'], ['value' => '', 'description' => 'Xendit API Secret Key']);
        Setting::updateOrCreate(['key' => 'xendit_webhook_token'], ['value' => '', 'description' => 'Xendit Webhook/Callback Token']);

        // 7. Certificates Table Seed
        Certificate::updateOrCreate(['id' => 10], [
            'category' => 'good',
            'file_path' => 'certificates/good.jpg',
            'description' => 'Good'
        ]);
        Certificate::updateOrCreate(['id' => 11], [
            'category' => 'excellent',
            'file_path' => 'certificates/excellent.jpg',
            'description' => 'Excellent'
        ]);
        Certificate::updateOrCreate(['id' => 12], [
            'category' => 'standard',
            'file_path' => 'certificates/standard.jpg',
            'description' => 'Standar'
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('BecdexLookupSeeder: Seeded lookups (13 sectors, 6 indicator statuses, 153 countries, categories, submission statuses) matching production database.');
    }
}
