<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\BecdexCategory;
use App\Models\SubmissionStatus;
use App\Models\PerIndicatorStatus;
use App\Models\Setting;

class BecdexLookupSeeder extends Seeder
{
    public function run(): void
    {
        // BECdex Categories
        $cats = [
            ['id'=>1,'name'=>'Not a Blue Economy Company','max_score'=>68,'color'=>'danger'],
            ['id'=>2,'name'=>'Standard Blue Economy Company','max_score'=>78,'color'=>'info'],
            ['id'=>3,'name'=>'Good Blue Economy Company','max_score'=>88,'color'=>'primary'],
            ['id'=>4,'name'=>'Excellent Economy Company','max_score'=>100,'color'=>'success'],
        ];
        foreach ($cats as $c) BecdexCategory::updateOrCreate(['id'=>$c['id']], $c);

        // Submission Statuses
        $statuses = [
            ['id'=>1,'name'=>'Pending Payment','color'=>'warning'],
            ['id'=>2,'name'=>'Document Submission','color'=>'info'],
            ['id'=>3,'name'=>'On Verification Process','color'=>'primary'],
            ['id'=>4,'name'=>'Document Revision','color'=>'warning'],
            ['id'=>5,'name'=>'Certified','color'=>'success'],
            ['id'=>6,'name'=>'Payment Successful','color'=>'success'],
            ['id'=>7,'name'=>'Continue To Location Survey','color'=>'light'],
            ['id'=>8,'name'=>'Approved (Ready for Survey)','color'=>'primary'],
            ['id'=>9,'name'=>'Rejected Permanently','color'=>'danger'],
        ];
        foreach ($statuses as $s) SubmissionStatus::updateOrCreate(['id'=>$s['id']], $s);

        // Per-Indicator Statuses
        $perInd = [
            ['id'=>1,'name'=>'Not Uploaded','color'=>'secondary'],
            ['id'=>2,'name'=>'Uploaded','color'=>'warning'],
            ['id'=>3,'name'=>'Submitted','color'=>'primary'],
            ['id'=>4,'name'=>'Verified','color'=>'success'],
            ['id'=>5,'name'=>'Declined','color'=>'danger'],
        ];
        foreach ($perInd as $p) PerIndicatorStatus::updateOrCreate(['id'=>$p['id']], $p);

        // Settings
        Setting::updateOrCreate(['key'=>'payment_amount'], ['value'=>'100000','description'=>'Certification fee in IDR']);
        Setting::updateOrCreate(['key'=>'xendit_secret_key'], ['value'=>'','description'=>'Xendit API Secret Key']);
        Setting::updateOrCreate(['key'=>'xendit_webhook_token'], ['value'=>'','description'=>'Xendit Webhook/Callback Token']);

        // Certificates Table Seed
        \App\Models\Certificate::updateOrCreate(['id' => 10], [
            'category' => 'good',
            'file_path' => 'certificates/good.jpg',
            'description' => 'Good'
        ]);
        \App\Models\Certificate::updateOrCreate(['id' => 11], [
            'category' => 'excellent',
            'file_path' => 'certificates/excellent.jpg',
            'description' => 'Excellent'
        ]);
        \App\Models\Certificate::updateOrCreate(['id' => 12], [
            'category' => 'standard',
            'file_path' => 'certificates/standard.jpg',
            'description' => 'Standar'
        ]);

        // Company Fields (Sectors)
        $fields = [
            ['id' => 1, 'name' => 'Perikanan Tangkap & Budidaya'],
            ['id' => 2, 'name' => 'Bioteknologi & Pengolahan Hasil Laut'],
            ['id' => 3, 'name' => 'Pariwisata Bahari & Ekowisata'],
            ['id' => 4, 'name' => 'Transportasi & Logistik Maritim'],
            ['id' => 5, 'name' => 'Energi Terbarukan Laut'],
            ['id' => 6, 'name' => 'Jasa & Teknologi Kelautan'],
        ];
        foreach ($fields as $f) \App\Models\CompanyField::updateOrCreate(['id' => $f['id']], $f);

        // Coastal Countries
        $countries = [
            ['id' => 1, 'iso' => 'IDN', 'name' => 'Indonesia'],
            ['id' => 2, 'iso' => 'MYS', 'name' => 'Malaysia'],
            ['id' => 3, 'iso' => 'SGP', 'name' => 'Singapore'],
            ['id' => 4, 'iso' => 'THA', 'name' => 'Thailand'],
            ['id' => 5, 'iso' => 'PHL', 'name' => 'Philippines'],
            ['id' => 6, 'iso' => 'VNM', 'name' => 'Vietnam'],
            ['id' => 7, 'iso' => 'AUS', 'name' => 'Australia'],
        ];
        foreach ($countries as $c) \App\Models\Country::updateOrCreate(['id' => $c['id']], $c);
    }
}

